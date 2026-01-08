import "./style.css";
import { Viewer } from "@photo-sphere-viewer/core";
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import { MapPlugin } from "@photo-sphere-viewer/map-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";
import "@photo-sphere-viewer/map-plugin/index.css";

const PANORAMA_WIDTH = 9000;
const TILE_COLS = 16;
const TILE_ROWS = 8;

const nodes = [
    {
        id: "room1",
        panorama: {
            width: PANORAMA_WIDTH,
            cols: TILE_COLS,
            rows: TILE_ROWS,
            baseUrl: "/room1_low.jpg",
            tileUrl: (col, row) => `/tiles/room1/room1_${col}_${row}.jpg`,
        },
        name: "Room 1",
        map: {
            center: { x: 400, y: 300 },
        },
        links: [
            { nodeId: "room2", position: { textureX: 1500, textureY: 780 } },
            { nodeId: "room3", position: { textureX: 3000, textureY: 780 } },
        ],
    },
    {
        id: "room2",
        panorama: {
            width: PANORAMA_WIDTH,
            cols: TILE_COLS,
            rows: TILE_ROWS,
            baseUrl: "/room2_low.jpg",
            tileUrl: (col, row) => `/tiles/room2/room2_${col}_${row}.jpg`,
        },
        name: "Room 2",
        map: {
            center: { x: 600, y: 300 },
        },
        links: [
            { nodeId: "room1", position: { textureX: 3000, textureY: 780 } },
            { nodeId: "room3", position: { textureX: 1500, textureY: 780 } },
        ],
    },
    {
        id: "room3",
        panorama: {
            width: PANORAMA_WIDTH,
            cols: TILE_COLS,
            rows: TILE_ROWS,
            baseUrl: "/room3_low.jpg",
            tileUrl: (col, row) => `/tiles/room3/room3_${col}_${row}.jpg`,
        },
        name: "Room 3",
        map: {
            center: { x: 500, y: 400 },
        },
        links: [
            { nodeId: "room1", position: { textureX: 1500, textureY: 780 } },
            { nodeId: "room2", position: { textureX: 3000, textureY: 780 } },
        ],
    },
];
const baseUrl = "https://photo-sphere-viewer-data.netlify.app/assets/";
// --- 3. INITIALIZE VIEWER ---
function initApp() {
    const viewer = new Viewer({
        container: document.querySelector("#viewer"),
        adapter: EquirectangularTilesAdapter,
        navbar: false,
        defaultZoomLvl: 50,
        plugins: [
            MapPlugin.withConfig({
                imageUrl: baseUrl + "map.jpg",
                center: { x: 807, y: 607 },
                rotation: "135deg",
                defaultZoom: 40,
                shape: "square",
            }),
            [
                VirtualTourPlugin,
                {
                    map: {
                        imageUrl: baseUrl + "map.jpg",
                    },
                    positionMode: "manual",
                    renderMode: "3d",
                    startNodeId: "room1",
                    preload: true,
                    transitionOptions: {
                        showLoader: false,
                    },
                    nodes: nodes,
                },
            ],
        ],
    });

    const virtualTour = viewer.getPlugin(VirtualTourPlugin);

    // --- 4. BUTTON HANDLERS ---
    function switchToNode(nodeId) {
        const currentNodeId = virtualTour.getCurrentNode()?.id;
        if (currentNodeId !== nodeId) {
            virtualTour.setCurrentNode(nodeId);
        }
    }

    document.getElementById("btn-1").addEventListener("click", () => {
        switchToNode("room1");
    });

    document.getElementById("btn-2").addEventListener("click", () => {
        switchToNode("room2");
    });

    document.getElementById("btn-3").addEventListener("click", () => {
        switchToNode("room3");
    });
}

// Run the app
initApp();
