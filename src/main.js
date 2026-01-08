import "./style.css";
import { Viewer } from "@photo-sphere-viewer/core";

import { MapPlugin } from "@photo-sphere-viewer/map-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";
import "@photo-sphere-viewer/map-plugin/index.css";

const baseUrl = "https://photo-sphere-viewer-data.netlify.app/assets/";

// --- 1. ROOM CONFIGURATION MAPPING ---
// Helper function to convert degrees to radians (Photo Sphere Viewer uses radians)
function degToRad(degrees) {
    return (degrees * Math.PI) / 180;
}

// Helper function to convert radians to degrees
function radToDeg(radians) {
    return (radians * 180) / Math.PI;
}

// Map image dimensions (adjust based on actual map.jpg size)
const MAP_IMAGE_WIDTH = 1600;
const MAP_IMAGE_HEIGHT = 1200;
const MAP_CENTER_X = MAP_IMAGE_WIDTH / 2;
const MAP_CENTER_Y = MAP_IMAGE_HEIGHT / 2;

// Hotspot pixel coordinates on the map image
// Converted from polar coordinates (yaw, distance) to cartesian (x, y)
// Formula: x = centerX + distance * cos(yaw), y = centerY - distance * sin(yaw)
const hotspotCoords = {
    room1: {
        x: MAP_CENTER_X + 140 * Math.cos(degToRad(45)),
        y: MAP_CENTER_Y - 140 * Math.sin(degToRad(45)),
        tooltip: "Room 1",
        color: "blue",
    },
    room2: {
        x: MAP_CENTER_X + 140 * Math.cos(degToRad(-45)),
        y: MAP_CENTER_Y - 140 * Math.sin(degToRad(-45)),
        tooltip: "Room 2",
        color: "red",
    },
    room3: {
        x: MAP_CENTER_X + 140 * Math.cos(degToRad(180)),
        y: MAP_CENTER_Y - 140 * Math.sin(degToRad(180)),
        tooltip: "Room 3",
        color: "green",
    },
};

// Store the original yaw angles that correspond to hotspot positions
// These are the angles from the map center to each hotspot
const roomConfig = {
    room1: {
        panorama: "/room1.jpg",
        yaw: degToRad(45), // Original yaw for Room 1 hotspot
    },
    room2: {
        panorama: "/room2.jpg",
        yaw: degToRad(-45), // Original yaw for Room 2 hotspot
    },
    room3: {
        panorama: "/room3.jpg",
        yaw: degToRad(180), // Original yaw for Room 3 hotspot
    },
};

// --- 2. INITIALIZE VIEWER ---
function initApp() {
    const viewer = new Viewer({
        container: document.querySelector("#viewer"),
        panorama: "/room1.jpg",
        defaultYaw: roomConfig.room1.yaw, // Start facing Room 1 hotspot direction
        plugins: [
            MapPlugin.withConfig({
                imageUrl: baseUrl + "map.jpg",
                // Center on the geometric center of the map image for balanced fitting
                center: { x: MAP_CENTER_X, y: MAP_CENTER_Y },
                rotation: "0deg",
                // Zoom constraints to prevent panning (forces entire image into container)
                defaultZoom: 40,
                minZoom: 40,
                maxZoom: 40,
                shape: "square",
                // Static map: prevents rotation, only hotspot indicators move
                static: true,
                hotspots: [
                    {
                        // Use polar coordinates (yaw + distance) so pin aligns correctly
                        // When viewer yaw matches hotspot yaw, pin will be at hotspot position
                        yaw: "45deg",
                        distance: 140, // pixels from center
                        tooltip: hotspotCoords.room1.tooltip,
                        color: hotspotCoords.room1.color,
                    },
                    {
                        yaw: "-45deg",
                        distance: 140,
                        tooltip: hotspotCoords.room2.tooltip,
                        color: hotspotCoords.room2.color,
                    },
                    {
                        yaw: "180deg",
                        distance: 140,
                        tooltip: hotspotCoords.room3.tooltip,
                        color: hotspotCoords.room3.color,
                    },
                ],
            }),
        ],
    });

    // --- 3. GET MAPPLUGIN REFERENCE ---
    const mapPlugin = viewer.getPlugin(MapPlugin);

    // --- 4. BUTTON HANDLERS ---
    function switchToRoom(roomId) {
        const config = roomConfig[roomId];
        if (!config) return;

        // Switch panorama and rotate to hotspot yaw
        viewer.setPanorama(config.panorama).then(() => {
            // Wait a bit for panorama to fully render
            setTimeout(() => {
                //    get map plugin reference
                const mapPlugin = viewer.getPlugin(MapPlugin);
                //    get hotspot coordinates
                const hotspot = hotspotCoords[roomId];
                //    rotate viewer to hotspot yaw
                mapPlugin.setCenter(hotspot.x, hotspot.y);
            }, 100);
        });
    }

    document.getElementById("btn-1").addEventListener("click", () => {
        switchToRoom("room1");
    });

    document.getElementById("btn-2").addEventListener("click", () => {
        switchToRoom("room2");
    });

    document.getElementById("btn-3").addEventListener("click", () => {
        switchToRoom("room3");
    });
}

// Run the app
initApp();
