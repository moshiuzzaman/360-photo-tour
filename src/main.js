import "./style.css";
import { Viewer } from "@photo-sphere-viewer/core";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";

// --- 1. CONFIGURATION ---
const imageUrls = {
    room1: "/room1.jpg",
    room2: "/room2.jpg",
    room3: "/room3.jpg",
};

// --- 2. THE SECRET SAUCE: BLOB PRELOADING ---
// This function downloads the image and creates a local memory link (Blob URL)
async function loadAsBlob(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// We wrap everything in an async function to wait for downloads
async function initApp() {
    // Download all images into RAM before starting
    // This might take 1-2 seconds on startup, but switching will be INSTANT later.
    const [blob1, blob2, blob3] = await Promise.all([
        loadAsBlob(imageUrls.room1),
        loadAsBlob(imageUrls.room2),
        loadAsBlob(imageUrls.room3),
    ]);

    // --- 3. DEFINE NODES WITH BLOB URLS ---
    const nodes = [
        {
            id: "room1",
            panorama: blob1, // Use the memory blob, not the file path
            name: "Room 1",
            links: [],
        },
        {
            id: "room2",
            panorama: blob2,
            name: "Room 2",
            links: [],
        },
        {
            id: "room3",
            panorama: blob3,
            name: "Room 3",
            links: [],
        },
    ];

    // --- 4. INITIALIZE VIEWER ---
    const viewer = new Viewer({
        container: document.querySelector("#viewer"),
        navbar: false,
        defaultZoomLvl: 50,
        plugins: [
            [
                VirtualTourPlugin,
                {
                    positionMode: "manual",
                    renderMode: "3d",
                    startNodeId: "room1",
                    preload: true,
                    nodes: nodes, // Pass our RAM-loaded nodes
                },
            ],
        ],
    });

    const virtualTour = viewer.getPlugin(VirtualTourPlugin);

    // --- 5. PRELOAD ALL PANORAMA TEXTURES INTO GPU MEMORY ---
    // Wait for viewer to be ready before preloading other textures
    // This eliminates loading screens when switching panoramas
    viewer.addEventListener("ready", () => {
        async function preloadRemainingTextures() {
            try {
                // Only preload textures that aren't currently loaded (room1 is already loaded)
                // Preload in sequence to avoid conflicts
                await viewer.textureLoader.preloadPanorama(blob2);
                await viewer.textureLoader.preloadPanorama(blob3);
                console.log("All panorama textures preloaded successfully");
            } catch (error) {
                // Ignore abort errors - they happen if panorama is already loading
                if (error.name !== "AbortError") {
                    console.warn("Error preloading some textures:", error);
                }
            }
        }

        // Preload remaining textures after initial panorama is loaded
        preloadRemainingTextures();
    });

    // --- 6. BUTTON LOGIC WITH INSTANT TRANSITIONS ---
    // Helper function to switch nodes with smooth fade transition
    async function switchToNode(nodeId, blobUrl) {
        const viewerContainer = document.querySelector("#viewer");
        const currentNodeId = virtualTour.getCurrentNode()?.id;

        // Don't switch if already on this node
        if (currentNodeId === nodeId) return;

        // Ensure texture is preloaded before switching
        try {
            await viewer.textureLoader.preloadPanorama(blobUrl);
        } catch (error) {
            // Ignore abort errors - texture might already be loading
            if (error.name !== "AbortError") {
                console.warn(`Error preloading ${nodeId}:`, error);
            }
        }

        // Switch to the node (texture should be preloaded, so this is instant)
        virtualTour.setCurrentNode(nodeId);
    }

    // Map node IDs to their blob URLs for quick lookup
    const nodeBlobMap = {
        room1: blob1,
        room2: blob2,
        room3: blob3,
    };

    // Set up button handlers for instant transitions
    document.getElementById("btn-1").addEventListener("click", () => {
        switchToNode("room1", nodeBlobMap.room1);
    });

    document.getElementById("btn-2").addEventListener("click", () => {
        switchToNode("room2", nodeBlobMap.room2);
    });

    document.getElementById("btn-3").addEventListener("click", () => {
        switchToNode("room3", nodeBlobMap.room3);
    });
}

// Run the app
initApp();
