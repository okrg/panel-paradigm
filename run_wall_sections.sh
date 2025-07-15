#!/bin/bash

# Script to run wall-section-tool.py on all OBJ files in obj/signature/left, obj/signature/right, and obj/signature/front
# with appropriate cut patterns based on file names

# Set the base directory
BASE_DIR="/Users/rolandogarcia/dev/panel-paradigm"
TOOL_PATH="$BASE_DIR/wall-section-tool.py"

# Check if the tool exists
if [ ! -f "$TOOL_PATH" ]; then
  echo "Error: wall-section-tool.py not found at $TOOL_PATH"
  exit 1
fi

# Function to process side wall files (left and right)
process_side_walls() {
  local target_dir=$1
  echo "Processing side wall files in: $target_dir"
  
  # Process each OBJ file in the target directory
  for obj_file in "$target_dir"/*.obj; do
    # Skip if no files match the pattern
    [ -e "$obj_file" ] || continue
    
    # Skip files that are already sectioned (contain "_section_" in the name)
    if [[ "$obj_file" == *"_section_"* ]]; then
      echo "Skipping already sectioned file: $obj_file"
      continue
    fi
    
    # Extract the base name of the file
    filename=$(basename "$obj_file")
    
    # Extract the size from the filename (L08/R08, L10/R10, L12/R12)
    if [[ "$filename" =~ ^[LR]([0-9]+) ]]; then
      size="${BASH_REMATCH[1]}"
      
      # Set the cut pattern based on the size
      cut_pattern=""
      case "$size" in
      "08")
        cut_pattern="2,4,2"
        ;;
      "10")
        cut_pattern="3,4,3"
        ;;
      "12")
        cut_pattern="4,4,4"
        ;;
      *)
        echo "Unknown size in filename: $filename, skipping"
        continue
        ;;
      esac
      
      echo "Processing: $filename with cut pattern: $cut_pattern"
      python "$TOOL_PATH" "$obj_file" --cut_pattern "$cut_pattern"
    else
      echo "Could not determine size from filename: $filename, skipping"
    fi
  done
}

# Function to process front wall files
process_front_walls() {
  local target_dir=$1
  echo "Processing front wall files in: $target_dir"
  
  # Process each OBJ file in the target directory
  for obj_file in "$target_dir"/*.obj; do
    # Skip if no files match the pattern
    [ -e "$obj_file" ] || continue
    
    # Skip files that are already sectioned (contain "_section_" in the name)
    if [[ "$obj_file" == *"_section_"* ]]; then
      echo "Skipping already sectioned file: $obj_file"
      continue
    fi
    
    # Extract the base name of the file
    filename=$(basename "$obj_file")
    
    # Extract the size from the filename (F10, F12, F14, etc.)
    if [[ "$filename" =~ ^F([0-9]+) ]]; then
      size="${BASH_REMATCH[1]}"
      
      # Set the cut pattern based on the size
      cut_pattern=""
      case "$size" in
      "10")
        cut_pattern="3,4,3"
        ;;
      "12")
        cut_pattern="4,4,4"
        ;;
      "14")
        cut_pattern="4,6,4"
        ;;
      "16")
        cut_pattern="6,4,6"
        ;;
      "20")
        cut_pattern="6,8,6"
        ;;
      *)
        echo "Unknown size in filename: $filename, skipping"
        continue
        ;;
      esac
      
      echo "Processing: $filename with cut pattern: $cut_pattern"
      python "$TOOL_PATH" "$obj_file" --cut_pattern "$cut_pattern"
    else
      echo "Could not determine size from filename: $filename, skipping"
    fi
  done
}

# Process left wall panels
LEFT_DIR="$BASE_DIR/obj/signature/left"
process_side_walls "$LEFT_DIR"

# Process right wall panels
RIGHT_DIR="$BASE_DIR/obj/signature/right"
process_side_walls "$RIGHT_DIR"

# Process front wall panels
FRONT_DIR="$BASE_DIR/obj/signature/front"
process_front_walls "$FRONT_DIR"

echo "All files processed."
