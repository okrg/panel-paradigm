# Wall Section Tool with Manual Group Parsing and Preservation
import trimesh
import numpy as np
import os
import argparse
import re
from collections import defaultdict # Useful for organizing geometry by group and section
import sys # To handle potential console encoding issues on some systems

# Ensure console output can handle potential characters in filenames/groups
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')


def calculate_cut_planes(section_lengths_ft):
    """
    Calculates the X-coordinates of the RELATIVE cut planes based on a list of section lengths.
    These are relative to the START of the wall (0.0).
    Args:
        section_lengths_ft (list of float): List of section lengths in feet.
                                            Example: [3.0, 6.0, 3.0]
    Returns:
        list of float: RELATIVE X-coordinates of the cut planes in feet.
                       Example: [3.0, 9.0] for sections [3,6,3]
    Units are in feet.
    Assumes wall starts at X=0 and extends positively along X for relative cuts.
    """
    cut_coords_ft = []
    current_position_ft = 0.0
    # Iterate through all but the last section length to define cut planes
    if len(section_lengths_ft) > 1:
        for i in range(len(section_lengths_ft) - 1):
            current_position_ft += section_lengths_ft[i]
            cut_coords_ft.append(current_position_ft)

    return cut_coords_ft

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
                                # Add basic check for valid index range
                                if v_index >= 0 and v_index < len(all_vertices):
                                     face_v_indices.append(v_index)
                                else:
                                     print(f"    Warning: Skipping invalid face vertex index ({v_index_str}) in line: {line}")
                                     face_v_indices = [] # Discard entire face if any index is bad
                                     break # Stop processing parts for this face

                        if len(face_v_indices) >= 3: # Faces must have at least 3 vertices
                            face_definitions.append((current_group, face_v_indices))
                        elif face_v_indices: # Had indices but less than 3
                             print(f"    Warning: Skipping face with less than 3 vertices: {line}")


                    except (ValueError, IndexError):
                        print(f"    Warning: Skipping invalid face line: {line}")
                        continue
                # Add handling for other prefixes like 'vn', 'vt', 'usemtl' if needed later

    except FileNotFoundError:
        print(f"Error: File not found during manual parsing: {filepath}")
        return {}
    except Exception as e:
         print(f"An error occurred during manual OBJ parsing: {e}", exc_info=True)
         return {}


    # Now, create trimesh objects for each group
    group_meshes = {}
    unique_groups = sorted(list(set(fd[0] for fd in face_definitions))) # Get unique group names

    if not all_vertices:
        print("    Warning: No vertices found in the OBJ file.")
        return {}
    if not face_definitions:
         print("    Warning: No faces found in the OBJ file.")
         return {}
    if not unique_groups:
         print("    Warning: No distinct groups found or assigned to faces.")
         # If no groups found, treat all faces under the default group
         unique_groups = ["default"]
         # Assign all faces to default group if they weren't already
         if any(fd[0] == "default" for fd in face_definitions):
              pass # Already assigned to default
         else:
              face_definitions = [("default", fd[1]) for fd in face_definitions]


    print(f"    Found {len(all_vertices)} vertices.")
    print(f"    Found {len(face_definitions)} faces across {len(unique_groups)} groups.")


    for group_name in unique_groups:
        # Find all faces belonging to this group
        group_faces_global_indices = [fd[1] for fd in face_definitions if fd[0] == group_name]

        if not group_faces_global_indices:
            # print(f"    No faces found for group '{group_name}'. Skipping group mesh creation.")
            continue # Skip groups with no faces

        # Find all UNIQUE global vertex indices referenced by these faces
        referenced_global_v_indices = sorted(list(set(
            v_idx for face in group_faces_global_indices for v_idx in face
        )))

        if not referenced_global_v_indices:
             print(f"    Warning: Group '{group_name}' has faces defined but they reference no valid vertices. Skipping.")
             continue

        # Create a mapping from original global vertex index to new group-local 0-based index
        global_to_local_v_map = {global_idx: local_idx for local_idx, global_idx in enumerate(referenced_global_v_indices)}

        # Create the vertex list for this group (subset of all_vertices)
        group_subset_vertices = np.array([all_vertices[global_idx] for global_idx in referenced_global_v_indices], dtype=np.float64)

        # Create the face list for this group, with indices remapped to be local to group_subset_vertices
        group_local_faces = []
        for face_global_indices in group_faces_global_indices:
            try:
                # Map global indices to local indices
                local_face = [global_to_local_v_map[global_idx] for global_idx in face_global_indices]
                group_local_faces.append(local_face)
            except KeyError:
                print(f"    Warning: Face in group '{group_name}' references a vertex index not in the group's subset. Skipping face.")
                # This indicates an issue in parsing or OBJ structure where a face in a group
                # refers to a vertex not included in the set of vertices identified for that group.
                continue

        # Convert to numpy array format required by trimesh
        if not group_local_faces:
            # print(f"    Warning: No valid faces found for group '{group_name}' after remapping. Skipping group mesh creation.")
            continue # Skip if no valid faces after remapping

        # Assuming all faces are triangles for simplicity (trimesh default)
        # If quads or ngons exist, need more complex handling here to split them if needed.
        # Trimesh TriMesh constructor expects (n, 3) array for triangles.
        # If faces have mixed sizes, need to handle this (e.g., convert quads to two triangles).
        # For basic faces (triangles/quads), trimesh often handles list of lists. Let's try that.
        try:
            # Attempt to create the trimesh object for the group
            group_mesh = trimesh.Trimesh(vertices=group_subset_vertices, faces=group_local_faces, process=False)
            if group_mesh.vertices.shape[0] > 0 and group_mesh.faces.shape[0] > 0:
                 group_meshes[group_name] = group_mesh
                 # print(f"    Created trimesh for group '{group_name}' with {len(group_mesh.vertices)} vertices and {len(group_mesh.faces)} faces.")
            else:
                 # print(f"    Warning: Trimesh creation resulted in empty mesh for group '{group_name}'. Skipping.")
                 pass # Don't add empty meshes
        except Exception as e:
             print(f"    Error creating trimesh for group '{group_name}': {e}. Skipping group.")


    return group_meshes


def slice_group_geometry(group_mesh, absolute_cut_planes_inches_sorted):
    """
    Slices a single trimesh object (representing a group's geometry) by ABSOLUTE planes (in inches).
    Returns a list of trimesh pieces (also in inches).
    Assumes cutting planes are perpendicular to the X-axis.
    Uses trimesh.intersections.slice_mesh_plane.
    """
    if group_mesh.vertices.shape[0] == 0:
        return []

    all_fragments = [group_mesh.copy()] # Start with the whole group mesh as the initial fragment
    sorted_x_cuts_inches = sorted(absolute_cut_planes_inches_sorted)

    if not sorted_x_cuts_inches:
        # No cuts, return the original mesh as a single piece
        return all_fragments


    for x_cut_inch in sorted_x_cuts_inches:
        new_fragments = []
        plane_origin = [x_cut_inch, 0, 0]

        for fragment in all_fragments:
            if fragment.vertices.shape[0] == 0: continue

            # Cut the fragment into two parts
            # slice_mesh_plane returns a *list* if the slice results in multiple pieces
            # or intersects non-manifold geometry, otherwise it returns a single mesh or None.
            left_part_result = trimesh.intersections.slice_mesh_plane(mesh=fragment, plane_normal=[-1,0,0], plane_origin=plane_origin, cap=True)
            right_part_result = trimesh.intersections.slice_mesh_plane(mesh=fragment, plane_normal=[1,0,0], plane_origin=plane_origin, cap=True)

            # Process results from slice_mesh_plane carefully
            left_parts = left_part_result if isinstance(left_part_result, list) else ([left_part_result] if left_part_result is not None else [])
            right_parts = right_part_result if isinstance(right_part_result, list) else ([right_part_result] if right_part_result is not None else [])

            # Add the resulting parts to the list of new fragments for the next iteration
            new_fragments.extend([p for p in left_parts + right_parts if p and p.vertices.shape[0] > 0])

        all_fragments = new_fragments # These are the fragments after processing with this cut plane

    # Filter out any empty results
    return [f for f in all_fragments if f and f.vertices.shape[0] > 0]


# --- New function to determine which section a piece belongs to ---
def assign_piece_to_section(piece, absolute_cut_planes_inches_sorted, wall_min_x_inches, wall_max_x_inches):
    """
    Determines which logical section (0-indexed) a geometry piece belongs to.
    Sections are defined by the wall boundaries and absolute cut planes (in inches).
    Args:
        piece (trimesh.Trimesh): The geometry piece.
        absolute_cut_planes_inches_sorted (list of float): Sorted list of absolute cut X-coords (inches).
        wall_min_x_inches (float): Absolute min X bound of the entire wall mesh (inches).
        wall_max_x_inches (float): Absolute max X bound of the entire wall mesh (inches).
    Returns:
        int or None: The 0-indexed section number, or None if assignment fails.
    """
    if piece.vertices.shape[0] == 0:
        return None # Empty piece

    # Get the center of the piece along the X axis
    # Using the centroid of the bounding box is more stable than mean vertex for disconnected pieces
    # Check for valid bounds before calculating center
    if piece.bounds is None or piece.bounds[0] is None or piece.bounds[1] is None:
         # This might happen for invalid meshes or results from slicing issues
         print(f"  Warning: Piece has invalid bounds. Cannot assign to section.")
         return None

    piece_center_x = (piece.bounds[0][0] + piece.bounds[1][0]) / 2.0

    # Define section boundaries based on cut planes and wall bounds
    boundaries = [wall_min_x_inches] + absolute_cut_planes_inches_sorted + [wall_max_x_inches]

    # Use a small tolerance for boundary checks
    tolerance = 1e-3 # inches (increased slightly for robustness)

    # Find which section the piece_center_x falls into using boundaries [inclusive_start, exclusive_end)
    for i in range(len(boundaries) - 1):
        section_start = boundaries[i]
        section_end = boundaries[i+1]

        # Check if piece center is within the section boundaries, accounting for tolerance
        if (piece_center_x >= section_start - tolerance and piece_center_x < section_end + tolerance):
             # Optional: Add a check to see if the *entire* piece is roughly within these bounds
             # piece_min_x, piece_max_x = piece.bounds[0][0], piece.bounds[1][0]
             # if piece_min_x >= section_start - tolerance and piece_max_x <= section_end + tolerance:
             return i # Return the 0-indexed section number


    # Fallback/Debug: If center didn't match, print info
    # print(f"  Warning: Piece center X={piece_center_x:.2f} inches did not fall into any section range. Bounds: ({piece.bounds[0][0]:.2f}, {piece.bounds[1][0]:.2f}). Boundaries: {boundaries}")
    return None # Could not assign


# --- Function to manually write an OBJ file for a single section, preserving groups ---
def write_section_obj(filepath, section_geometry_by_group):
    """
    Writes an OBJ file for a single section, including group tags.
    section_geometry_by_group is a dict: {'original_group_name': [list_of_trimesh_pieces], ...}
    Vertices and face indices are handled relative to the start of this section's OBJ file.
    Assumes vertex coordinates are in inches, as processed by trimesh.
    Does NOT handle normals, texture coordinates, or materials.
    Adds smoothing group 1 (s 1) assuming the original mesh used smoothing groups.
    """
    print(f"  Writing section OBJ: {filepath}")

    # Collect all vertices for this section first to handle indexing correctly
    all_section_vertices = []
    # Map from (group_name, piece_index_in_group_list, local_vertex_index_in_piece)
    # to the global vertex index in the section's OBJ file (1-based).
    vertex_map = {}
    global_vertex_index = 1 # OBJ indices are 1-based

    # First pass: collect all vertices and build the map
    # This pass collects vertices in the order they appear group by group, piece by piece.
    # This is simple but doesn't deduplicate vertices.
    for group_name, pieces in section_geometry_by_group.items():
        for piece_idx, piece in enumerate(pieces):
            if piece.vertices.shape[0] == 0: continue
            for local_v_idx, vertex in enumerate(piece.vertices):
                all_section_vertices.append(vertex)
                # Store the mapping
                vertex_map[(group_name, piece_idx, local_v_idx)] = global_vertex_index
                global_vertex_index += 1

    # Second pass: write the OBJ file
    with open(filepath, 'w') as f:
        f.write("# Generated section OBJ file (with groups)\n")
        f.write(f"# From source: {os.path.basename(os.path.dirname(filepath))}/{os.path.basename(filepath).replace('_sections', '').replace('_section_', '_')}\n") # Add source info

        # Write all vertices (assuming they are in inches)
        for v in all_section_vertices:
            f.write(f"v {v[0]} {v[1]} {v[2]}\n")

        # Write faces, organized by group
        # Sort group names for consistent output order
        for group_name in sorted(section_geometry_by_group.keys()):
            pieces = section_geometry_by_group[group_name]
            if not pieces:
                continue # Should not happen due to sections_data structure, but safety check

            # Clean up group name for OBJ file if needed (replace problematic characters)
            safe_group_name = re.sub(r'[\s\(\)\{\}\[\]\<\>\'\"\\\/\!\@\#\$\%\^\&\*\+\=\|;:,~`]+', '_', group_name).strip('_')
            if not safe_group_name: safe_group_name = "group" # Fallback if name is empty or just underscores
            # print(f"  Writing group: {group_name} (as '{safe_group_name}')") # Verbose group writing

            f.write(f"g {safe_group_name}\n")
            # Add a default smoothing group 's 1' assuming smoothed surfaces
            f.write("s 1\n")


            for piece_idx, piece in enumerate(pieces):
                if piece.vertices.shape[0] == 0: continue

                # Write faces for this piece, using the global vertex indices
                # Trimesh faces are 0-indexed locally. OBJ faces are 1-based globally.
                for face in piece.faces:
                    # Get the global 1-based indices for the vertices of this face using the map
                    try:
                        global_face_indices = [
                            vertex_map[(group_name, piece_idx, local_v_idx)]
                            for local_v_idx in face
                        ]
                    except KeyError as e:
                        print(f"    Error mapping vertex index for face in group '{group_name}', piece {piece_idx}. Missing key: {e}. Skipping face.")
                        continue # Skip this face if mapping fails

                    # Ensure faces have at least 3 vertices before writing
                    if len(global_face_indices) >= 3:
                        # Assuming faces are triangles or quads for OBJ 'f' format
                        f.write("f " + " ".join(map(str, global_face_indices)) + "\n")
                    else:
                        print(f"    Warning: Skipping face in group '{group_name}', piece {piece_idx} with less than 3 mapped vertices ({len(global_face_indices)}).")


            # Optional: Add blank line after group for readability
            # f.write("\n")


    print(f"  Finished writing {filepath}")


def process_wall_file(filepath, output_dir, section_lengths_ft):
    """
    Processes a single OBJ wall file: calculates cuts based on section_lengths_ft,
    manually parses for groups, sections geometry per group, and manually saves section OBJs with groups.
    """
    filename = os.path.basename(filepath)
    name, ext = os.path.splitext(filename)

    print(f"Processing {filename} with cut pattern {section_lengths_ft} ft (preserving groups)...")

    try:
        # --- 1. Manually Parse OBJ to get trimesh objects per group ---
        group_meshes = parse_obj_with_groups(filepath)

        if not group_meshes:
            print(f"  Could not obtain group meshes from {filename}. Skipping sectioning.")
            return

        # Get overall wall bounds from *all* loaded group meshes
        # Create a temporary scene to get the combined bounds reliably
        combined_scene = trimesh.Scene(list(group_meshes.values()))

        wall_bounds = combined_scene.bounds
        if wall_bounds is None:
             print(f"  Warning: Could not get bounds for the combined mesh from {filename}. Skipping.")
             return

        wall_min_x_inches = wall_bounds[0][0]
        wall_max_x_inches = wall_bounds[1][0]
        actual_mesh_width_inches = wall_max_x_inches - wall_min_x_inches # Correct width calculation

        # --- Validation ---
        actual_mesh_width_ft = actual_mesh_width_inches / 12.0
        pattern_total_width_ft = sum(section_lengths_ft)
        tolerance_ft = 0.5 # Define a tolerance for the check (e.g., 0.5 feet = 6 inches)

        print(f"  Actual combined mesh width: {actual_mesh_width_ft:.2f} ft ({actual_mesh_width_inches:.2f} inches)")
        print(f"  Cut pattern total width: {pattern_total_width_ft:.2f} ft")

        if abs(actual_mesh_width_ft - pattern_total_width_ft) > tolerance_ft:
            error_msg = (
                f"Validation Error: The total width from the cut pattern ({pattern_total_width_ft:.2f} ft) "
                f"does not match the actual combined mesh width ({actual_mesh_width_ft:.2f} ft) "
                f"within the allowed tolerance of {tolerance_ft} ft. Please check your cut pattern "
                f"or the OBJ file dimensions."
            )
            print(f"Warning: {error_msg}")
            # Decide whether to stop or continue. Let's continue but warn.
            # raise ValueError(error_msg) # Uncomment to make this a hard error

        # --- Calculate Absolute Cut Planes ---
        # 2. Calculate RELATIVE cut planes (X-coordinates in feet from wall start)
        relative_cut_planes_ft = calculate_cut_planes(section_lengths_ft)
        print(f"  Calculated relative cuts at X: {relative_cut_planes_ft} feet from wall start")

        # Convert relative foot cuts to ABSOLUTE inch cuts, relative to the ACTUAL minimum X of the mesh.
        absolute_cut_planes_inches = [wall_min_x_inches + (cut_ft * 12.0) for cut_ft in relative_cut_planes_ft]
        # Ensure cuts are sorted
        absolute_cut_planes_inches_sorted = sorted(absolute_cut_planes_inches)
        print(f"  Converted to ABSOLUTE cut X-coordinates (in inches): {absolute_cut_planes_inches_sorted}")

        # Dictionary to hold sliced pieces, organized by target section index and original group name
        # {section_index: {group_name: [list_of_trimesh_pieces], ...}, ...}
        sections_data = defaultdict(lambda: defaultdict(list))

        # --- 3. Iterate through each group's geometry and slice ---
        print(f"  Processing {len(group_meshes)} groups for slicing.")
        for group_name, group_mesh in group_meshes.items():
            if group_mesh.vertices.shape[0] == 0: continue # Should be handled by parse_obj_with_groups

            # print(f"  Slicing group: '{group_name}'...")
            # 4. Slice this group's geometry using all calculated cut planes
            # This returns a list of all fragments for this group across all sections
            group_sliced_fragments = slice_group_geometry(group_mesh, absolute_cut_planes_inches_sorted)
            # print(f"    Sliced group '{group_name}' into {len(group_sliced_fragments)} fragments.")

            # 5. Assign sliced fragments to target sections
            for piece in group_sliced_fragments:
                # Determine which section this piece belongs to based on its position
                section_index = assign_piece_to_section(piece, absolute_cut_planes_inches_sorted, wall_min_x_inches, wall_max_x_inches)
                if section_index is not None:
                    sections_data[section_index][group_name].append(piece)
                # else:
                    # print(f"    Warning: Fragment from group '{group_name}' at X={np.mean(piece.vertices[:,0]):.2f} could not be assigned to a section.")
                    # Pass - fragments that don't fall neatly might be tiny or problematic


        # --- 6. Write output OBJ files for each section ---
        if sections_data:
            # Determine the base directory for output. If input is a file, use its directory.
            output_base_dir = os.path.dirname(filepath)

            # Sort sections by index (0, 1, 2...) to ensure consistent output order
            sorted_section_indices = sorted(sections_data.keys())
            if not sorted_section_indices:
                 print("  No sections data found to write.")
                 return # Should be caught by if sections_data: check, but safety


            # Check if the number of generated sections matches the expected number from the pattern
            expected_sections = len(section_lengths_ft)
            if len(sections_data) != expected_sections:
                print(f"Warning: Expected {expected_sections} sections based on pattern, but generated {len(sections_data)}. Indices found: {sorted_section_indices}.")
                # Decide how to handle this - write what we have, or error? Let's write what we have.


            for section_index in sorted_section_indices:
                # Ensure sections are indexed from 1 for filenames
                section_filename = f"{name}_section_{section_index+1}.obj"
                section_filepath = os.path.join(output_base_dir, section_filename)

                # Write the OBJ file for this section, including group data
                write_section_obj(section_filepath, sections_data[section_index])

        else:
             print("  No section data was collected after processing groups and assigning fragments. No output files written.")


    except ValueError as e:
        print(f"Error processing {filename}: {e}")
    except NotImplementedError as e:
         print(f"Error processing {filename}: Rule not implemented for this file pattern: {e}")
    except Exception as e:
        print(f"An unexpected error occurred processing {filename}: {e}", exc_info=True) # Print traceback for unexpected errors


# --- Main execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Section an OBJ wall file into multiple sections based on a command-line provided cut pattern.\n"
            "Manually parses the OBJ to preserve original group structure within the output section files.\n"
            "Assumes the wall width is along the X-axis and the mesh coordinates are in INCHES.\n"
            "The --cut_pattern is specified as a comma-separated list of desired section lengths in FEET.\n"
            "Output sections for a file 'wall.obj' are saved to the same directory as the input file."
        ),
        formatter_class=argparse.RawTextHelpFormatter # Preserve newlines in help text
    )
    parser.add_argument(
        "obj_filepath",
        type=str,
        help="Path to the input OBJ file."
    )
    parser.add_argument(
        "--cut_pattern",
        type=str,
        required=True,
        help="Comma-separated string of desired section lengths in FEET (e.g., '3,6,3'). The sum should match the wall width."
    )

    args = parser.parse_args()

    target_obj_filepath = args.obj_filepath

    if not os.path.exists(target_obj_filepath):
        print(f"Error: Input OBJ file not found at {target_obj_filepath}")
        exit(1)
    if not os.path.isfile(target_obj_filepath):
         print(f"Error: Input path is not a file: {target_obj_filepath}")
         exit(1)


    try:
        # Parse the cut_pattern string into a list of floats
        section_lengths_ft_str = args.cut_pattern.split(',')
        section_lengths_ft = []
        for length_str in section_lengths_ft_str:
            try:
                length = float(length_str.strip()) # Strip whitespace
                if length <= 0:
                     raise ValueError("Section lengths must be positive.")
                section_lengths_ft.append(length)
            except ValueError:
                raise ValueError(f"Invalid number format in cut pattern: '{length_str}'")


        if not section_lengths_ft:
            raise ValueError("Cut pattern must not be empty.")

    except ValueError as e:
        print(f"Error: Invalid cut pattern '{args.cut_pattern}'. {e}")
        print("Please provide a comma-separated list of positive numbers (e.g., '3,6,3').")
        exit(1)

    # The output directory for a single file will be a subdirectory named after the file
    # in the same location as the input file. The process_wall_file function creates this subdir.
    output_base_directory = os.path.dirname(target_obj_filepath)

    print(f"Processing single file: {target_obj_filepath}")
    print(f"Using cut pattern (in feet): {section_lengths_ft}")

    # Pass the output_base_directory; process_wall_file will create the subdirectory
    process_wall_file(target_obj_filepath, output_base_directory, section_lengths_ft)

    print("Processing complete.")