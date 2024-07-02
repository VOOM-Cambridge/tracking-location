#!/bin/bash

while true; do
    # Prompt the user to plug in the USB device
    echo "Please unplug the USB device and press Enter to continue."
    read -r
    sleep 3s
    # Get the initial list of connected USB devices
    initial_devices=$(lsusb| sort)
    initial_inputs=$(ls -l /dev/input/by-path | sort)
    #echo "$initial_devices"
    # Loop until a USB device is removed

    # Prompt the user to plug in the USB device
    echo "Please plug in the USB device and press Enter to continue."
    read -r
    sleep 3s
    # Get the updated list of connected USB devices
    updated_devices=$(lsusb | sort)
    updated_inputs=$(ls -l /dev/input/by-path | sort)
    # echo "$updated_devices"
    # echo "$updated_inputs"

    # Find the removed USB device
    removed_device=$(comm -3 <(echo "$initial_devices") <(echo "$updated_devices")| awk '{print}')
    removed_input=$(comm -3 <(echo "$initial_inputs") <(echo "$updated_inputs")| awk '{print}')

    # echo "Device Removed: $removed_device" 
    # echo "Input Removed: $removed_input" 
    # Extract the Device information
    ID=$(echo "$removed_device" | sed -n 's/.*ID \([^ ]*\).*/\1/p' | tr ':' '_' | uniq)
    platform=$(echo "$removed_input" | sed 's/.*platform-\(.*\)-usb.*/\1/' | uniq)
    connection_port=$(echo "$removed_input" | sed 's/.*-usb-\([^:]*:[^:]*\).*/\1/' | uniq) # sed 's/.*platform-\(.*\)\..*/\1/')

    echo -e  "ID: \t \t \t $ID"
    echo -e  "Platform: \t \t $platform"
    echo -e  "Connection Point: \t $connection_port \n"
done
