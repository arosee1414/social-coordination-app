#!/bin/bash
# Update all color codes from indigo to iOS blue

for file in /src/app/components/*.tsx; do
  if [ -f "$file" ]; then
    sed -i 's/#4F46E5/#007AFF/g' "$file"
    sed -i 's/#4338CA/#0066CC/g' "$file"
    sed -i 's/#6366F1/#3B82F6/g' "$file"
  fi
done

echo "Color update complete"
