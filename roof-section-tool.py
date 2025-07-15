# Roof Section Tool with Manual Group Parsing and Preservation
import trimesh
import numpy as np
import os
import argparse
import re
from collections import defaultdict # Useful for organizing geometry by group and section
import sys # To handle potential console encoding issues on some systems
import math

# Ensure console output can handle potential characters in filenames/groups
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Define the component categories we want to extract
# These are the keywords to look for in group names
COMPONENT_CATEGORIES = {
    'eaves': 'eaves',    
    'drywall': 'drywall',
    'trim_color': 'trim-color',
    'sheathing': 'sheathing',
    'framing': 'framing'
}
def get_component_category(group_name):
    """
    Determines which component category a group belongs to based on its name.
    
    Args:
        group_name (str): The name of the group from the OBJ file.
        
    Returns:
        str or None: The matching component category key, or None if no match.
    """
    # Check if the group name contains any of our category keywords
    for category_key in COMPONENT_CATEGORIES:
        if category_key in group_name.lower():
            return category_key
            
    # No match found
    return None

def calculate_roof_sections(roof_width_ft):
    """
    Calculate section widths of equal size (2ft) for the roof.
    
    Args:
        roof_width_ft (float): Total width of the roof in feet.
    
    Returns:
        list of float: List of section widths in feet, all should be 2.0 except possibly the last one.
        list of float: RELATIVE X-coordinates of the cut planes in feet.
    """
    # Determine how many complete 2ft sections fit
    num_full_sections = int(roof_width_ft / 2.0)
    
    # Check if there's a remainder that needs to be handled
    remainder_ft = roof_width_ft - (num_full_sections * 2.0)
    
    # Create the section widths list
    section_widths_ft = [2.0] * num_full_sections
    
    # If there's a remainder and it's not too small, add it as a partial section
    if remainder_ft > 0.05:  # Only add if remainder is significant (more than ~1/2 inch)
        section_widths_ft.append(remainder_ft)
    
    # Calculate cut planes
    cut_coords_ft = []
    current_position_ft = 0.0
    
    # Iterate through all but the last section width to define cut planes
    if len(section_widths_ft) > 1:
        for i in range(len(section_widths_ft) - 1):
            current_position_ft += section_widths_ft[i]
            cut_coords_ft.append(current_position_ft)

    return section_widths_ft, cut_coords_ft


def parse_obj_with_groups(filepath):
    """
    Manually parses an OBJ file to extract vertices, faces, and group assignments.
    Creates and returns a dictionary of trimesh objects, one for each group.
    Handles v and f lines, and g lines for grouping.
    Assumes face indices are positive and 1-based referring to the vertex list.
    Does NOT handle normals, texture coordinates, negative indices, or complex face definitions.
    """
    print(f"  Manually parsing OBJ file: {filepath} to extract groups...")
    all_vertices = [] # List of all vertex coordinates [x, y, z]
    face_definitions = [] # List of (group_name, list_of_1based_vertex_indices) tuples

    current_group = "default" # Default group name if faces appear before any 'g' tag

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue # Skip empty lines and comments

                parts = line.split()
                if not parts:
                    continue # Skip empty parts after strip

                prefix = parts[0]

                if prefix == 'v':
                    # Vertex line: v x y z
                    try:
                        v = [float(p) for p in parts[1:4]]
                        all_vertices.append(v)
                    except (ValueError, IndexError):
                        print(f"    Warning: Skipping invalid vertex line: {line}")
                        continue
                elif prefix == 'g':
                    # Group line: g group_name [group_name2 ...]
                    # Joins all names after 'g' into a single group name string
                    current_group = " ".join(parts[1:]) if len(parts) > 1 else "default"
                    # print(f"    Found group: {current_group}") # Verbose group tracking
                elif prefix == 'f':
                    # Face line: f v1 v2 v3 ... (can have normals, textures, etc. - we only take vertex index)
                    face_v_indices = []
                    try:
                        for part in parts[1:]:
                            # Split by '/', take the first part which is the vertex index
                            v_index_str = part.split('/')[0]
                            if v_index_str: # Ensure it's not empty (like f // )
                                # Convert to 0-based index (OBJ is 1-based)
                                # Does NOT handle negative indices correctly yet
                                v_index = int(v_index_str) - 1
                                face_v_indices.append(v_index)
                    except (ValueError, IndexError) as e:
                        print(f"    Warning: Skipping invalid face: {line}. Error: {e}")
                        continue

                    if face_v_indices and len(face_v_indices) >= 3:
                        # Store the current group and these face vertex indices
                        face_definitions.append((current_group, face_v_indices))
                    else:
                        print(f"    Warning: Skipping invalid face (too few vertices): {line}")

    except Exception as e:
        print(f"  Error parsing OBJ file: {e}")
        raise

    if not all_vertices:
        print("  Error: No vertices found in the OBJ file")
        return {}

    print(f"    Found {len(all_vertices)} vertices.")
    
    # Organize faces by group
    faces_by_group = defaultdict(list)
    for group_name, face_vertices in face_definitions:
        faces_by_group[group_name].append(face_vertices)

    # Convert to numpy arrays and create trimesh objects for each group
    all_vertices_array = np.array(all_vertices)
    group_meshes = {}

    for group_name, group_faces in faces_by_group.items():
        if not group_faces:
            continue # Skip empty groups
        
        # Convert the list of face vertex lists to a numpy array
        faces_array = np.array(group_faces)
        
        # Create a trimesh for this group
        try:
            mesh = trimesh.Trimesh(vertices=all_vertices_array, faces=faces_array)
            
            # Check if the mesh is valid
            if mesh.is_empty or len(mesh.faces) == 0:
                print(f"    Warning: Group '{group_name}' resulted in an empty mesh. Skipping.")
                continue
                
            group_meshes[group_name] = mesh
        except Exception as e:
            print(f"    Warning: Failed to create mesh for group '{group_name}': {e}")

    print(f"    Found {len(faces_by_group)} groups across {len(face_definitions)} faces.")
    print(f"    Successfully created {len(group_meshes)} valid mesh objects from groups.")
    return group_meshes

def slice_group_geometry(group_mesh, absolute_cut_planes_inches_sorted):
    """
    Slices a single trimesh object (representing a group's geometry) by ABSOLUTE planes (in inches).
    Returns a list of trimesh pieces (also in inches).
    Assumes cutting planes are perpendicular to the X-axis.
    Uses trimesh.intersections.slice_mesh_plane.
    """
    if not absolute_cut_planes_inches_sorted:
        return [group_mesh] # No cuts to make
        
    pieces = [group_mesh] # Start with the whole mesh
    result_pieces = []
    
    # For each cutting plane, slice all existing pieces
    for cut_plane_x in absolute_cut_planes_inches_sorted:
        for piece in pieces:
            try:
                # Define the cutting plane: point on plane and normal vector
                plane_origin = np.array([cut_plane_x, 0, 0])
                plane_normal = np.array([1, 0, 0])
                
                # Slice the mesh - this returns a list of meshes (usually 2 if the plane intersects)
                slices = trimesh.intersections.slice_mesh_plane(
                    mesh=piece,
                    plane_origin=plane_origin,
                    plane_normal=plane_normal
                )
                
                # Add the resulting pieces to our collection
                result_pieces.extend(slices)
            except Exception as e:
                print(f"    Warning: Failed to slice piece at x={cut_plane_x}: {e}")
                result_pieces.append(piece) # Keep the original piece
        
        # Replace the working list with the new pieces
        pieces = result_pieces
        result_pieces = []
    
    # Return all pieces after all cuts
    return pieces


# --- New function to determine which section a piece belongs to ---
def assign_piece_to_section(piece, absolute_cut_planes_inches_sorted, roof_min_x_inches, roof_max_x_inches):
    """
    Determines which logical section (0-indexed) a geometry piece belongs to.
    Sections are defined by the roof boundaries and absolute cut planes (in inches).
    Args:
        piece (trimesh.Trimesh): The geometry piece.
        absolute_cut_planes_inches_sorted (list): Sorted list of x-coordinates of the cutting planes.
        roof_min_x_inches (float): Minimum x-coordinate of the roof.
        roof_max_x_inches (float): Maximum x-coordinate of the roof.
    Returns:
        int or None: The 0-indexed section number, or None if assignment fails.
    """
    if piece is None or piece.is_empty:
        return None

    # Get the x-coordinate of the centroid of the bounding box
    bbox_center = (piece.bounds[0][0] + piece.bounds[1][0]) / 2.0
    
    # Check if the piece is outside the roof bounds entirely
    if bbox_center < roof_min_x_inches or bbox_center > roof_max_x_inches:
        return None

    # Define the boundaries of each section
    # Add the min and max of the roof to the cut planes to define all section boundaries
    boundaries = [roof_min_x_inches] + absolute_cut_planes_inches_sorted + [roof_max_x_inches]
    
    # Determine which section this piece belongs to based on its centroid
    for i in range(len(boundaries) - 1):
        if bbox_center >= boundaries[i] and bbox_center <= boundaries[i + 1]:
            return i
    
    # If we get here, something went wrong with the boundary check
    print(f"    Warning: Failed to assign piece with bbox_center={bbox_center} to any section.")
    return None


# --- Function to manually write an OBJ file for a single section, preserving groups ---
def write_section_obj(filepath, section_geometry_by_group):
    """
    Writes an OBJ file for a single section, including group tags.
    section_geometry_by_group is a dict: {'original_group_name': [list_of_trimesh_pieces], ...}
    Writes the geometry in a standard OBJ format with 'g' tags to separate groups.
    Does NOT handle normals, texture coordinates, or materials.
    Adds smoothing group 1 (s 1) assuming the original mesh used smoothing groups.
    """
    # First, check if we have any geometry to write
    if not section_geometry_by_group:
        print(f"  Warning: No geometry to write for section {filepath}")
        return
    
    try:
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as obj_file:
            # Write header
            obj_file.write(f"# Roof section OBJ file\n")
            obj_file.write(f"# Generated by roof-section-tool.py\n")
            obj_file.write(f"# Original source groups preserved\n\n")
            
            # Standard OBJ scales
            obj_file.write("# File units = inches\n\n")
            
            # We need to track vertex indices as we write each group
            # OBJ files use global vertex indexing (1-indexed)
            vertex_index_offset = 1
            
            for group_name, trimesh_pieces in section_geometry_by_group.items():
                if not trimesh_pieces:
                    continue
                
                # Write the group name
                obj_file.write(f"g {group_name}\n")
                obj_file.write("s 1\n")  # Smoothing group
                
                for piece in trimesh_pieces:
                    if piece is None or piece.is_empty:
                        continue
                    
                    # Write all vertices for this piece
                    for vertex in piece.vertices:
                        obj_file.write(f"v {vertex[0]:.6f} {vertex[1]:.6f} {vertex[2]:.6f}\n")
                    
                    # Write all faces for this piece, adjusting vertex indices
                    for face in piece.faces:
                        # OBJ is 1-indexed, so we add the current offset to each vertex index
                        face_str = "f " + " ".join([f"{idx + vertex_index_offset}" for idx in face])
                        obj_file.write(f"{face_str}\n")
                    
                    # Update the offset for the next piece
                    vertex_index_offset += len(piece.vertices)
            
        print(f"  Finished writing {filepath}")
    
    except Exception as e:
        print(f"  Error writing section OBJ: {e}")


def write_component_obj(filepath, component_groups):
    """
    Writes an OBJ file for a single component category, preserving original groups.
    component_groups is a dict: {'original_group_name': trimesh_object, ...}
    """
    # First, check if we have any geometry to write
    if not component_groups:
        print(f"  Warning: No geometry to write for component {filepath}")
        return
    
    try:
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as obj_file:
            # Write header
            obj_file.write(f"# Roof component OBJ file\n")
            obj_file.write(f"# Generated by roof-section-tool.py\n")
            obj_file.write(f"# Original source groups preserved\n\n")
            
            # Standard OBJ scales
            obj_file.write("# File units = inches\n\n")
            
            # We need to track vertex indices as we write each group
            # OBJ files use global vertex indexing (1-indexed)
            vertex_index_offset = 1
            
            for group_name, mesh in component_groups.items():
                if mesh is None or mesh.is_empty:
                    continue
                
                # Write the group name
                obj_file.write(f"g {group_name}\n")
                obj_file.write("s 1\n")  # Smoothing group
                
                # Write all vertices for this mesh
                for vertex in mesh.vertices:
                    obj_file.write(f"v {vertex[0]:.6f} {vertex[1]:.6f} {vertex[2]:.6f}\n")
                
                # Write all faces for this mesh, adjusting vertex indices
                for face in mesh.faces:
                    # OBJ is 1-indexed, so we add the current offset to each vertex index
                    face_str = "f " + " ".join([f"{idx + vertex_index_offset}" for idx in face])
                    obj_file.write(f"{face_str}\n")
                
                # Update the offset for the next group
                vertex_index_offset += len(mesh.vertices)
        
        print(f"  Finished writing {filepath}")
    
    except Exception as e:
        print(f"  Error writing component OBJ: {e}")

def process_roof_file_by_components(filepath, output_dir):
    """
    Processes a single OBJ roof file: extracts components by category based on group names.
    """
    filename = os.path.basename(filepath)
    name_without_ext, ext = os.path.splitext(filename)
    
    try:
        print(f"Processing {filename} to extract component categories...")
        
        # First manually parse the OBJ file to extract group information
        group_meshes = parse_obj_with_groups(filepath)
        
        if not group_meshes:
            print("  No valid group geometry was found in the file.")
            return
        
        # Organize groups by component category
        components_data = defaultdict(dict)  # components_data[category_key][group_name] = mesh
        
        print(f"  Processing {len(group_meshes)} groups to categorize by component type...")
        
        # Count how many groups match each category
        category_counts = defaultdict(int)
        
        for group_name, mesh in group_meshes.items():
            category = get_component_category(group_name)
            if category:
                components_data[category][group_name] = mesh
                category_counts[category] += 1
            else:
                # Uncomment to see groups that don't match any category
                # print(f"  Group '{group_name}' doesn't match any component category")
                pass
        
        # Report on what we found
        for category in COMPONENT_CATEGORIES:
            count = category_counts.get(category, 0)
            print(f"  Found {count} groups matching '{category}' category")
        
        # Write each component category to a separate OBJ file
        for category_key, category_groups in components_data.items():
            if not category_groups:
                print(f"  No groups found for '{category_key}' category. Skipping file creation.")
                continue
                
            # Create the output filename based on the category
            output_filename = f"{name_without_ext}-{COMPONENT_CATEGORIES[category_key]}.obj"
            output_filepath = os.path.join(output_dir, output_filename)
            
            print(f"  Writing component OBJ: {output_filepath}")
            write_component_obj(output_filepath, category_groups)
    
    except ValueError as e:
        print(f"Error processing {filename}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred processing {filename}: {e}")
        import traceback
        traceback.print_exc()  # Print traceback for unexpected errors


# --- Main execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Extract component meshes from a roof OBJ file based on group names.\n"
            "Creates separate OBJ files for each component category (eave rafters, drywall, etc.).\n"
            "Manually parses the OBJ to preserve original group structure within the output files.\n"
            "Output files for a file 'roof.obj' are saved to the same directory as the input file."
        ),
        formatter_class=argparse.RawTextHelpFormatter  # Preserve newlines in help text
    )
    parser.add_argument(
        "obj_filepath",
        type=str,
        help="Path to the input OBJ file."
    )

    args = parser.parse_args()

    target_obj_filepath = args.obj_filepath

    if not os.path.exists(target_obj_filepath):
        print(f"Error: Input OBJ file not found at {target_obj_filepath}")
        exit(1)
    if not os.path.isfile(target_obj_filepath):
         print(f"Error: Input path is not a file: {target_obj_filepath}")
         exit(1)

    # The output directory will be the same as the input file location
    output_base_directory = os.path.dirname(target_obj_filepath)

    print(f"Processing roof file: {target_obj_filepath}")
    print(f"Looking for component categories: {list(COMPONENT_CATEGORIES.keys())}")

    # Process the roof file by components
    process_roof_file_by_components(target_obj_filepath, output_base_directory)

    print("Processing complete.")
