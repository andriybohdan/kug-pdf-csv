#!/bin/sh
echo "Converting $1 to CSV..."
pdftotext -layout $1 input.txt
node import.js -i input.txt -o output.csv
