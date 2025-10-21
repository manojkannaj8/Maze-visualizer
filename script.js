document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Constants and DOM Elements ---
    const gridContainer = document.getElementById('grid-container');
    const solveBtn = document.getElementById('solve-btn');
    const resetBtn = document.getElementById('reset-btn');
    const clearWallsBtn = document.getElementById('clear-walls-btn');
    const speedSlider = document.getElementById('speed-slider');
    const modeButtons = document.querySelectorAll('.mode-btn');

    // Get grid dimensions from CSS variables
    const style = getComputedStyle(document.documentElement);
    const ROWS = parseInt(style.getPropertyValue('--rows'));
    const COLS = parseInt(style.getPropertyValue('--cols'));

    // --- 2. State Variables ---
    let grid = []; // 2D array representing the grid
    let startNode = null; // { row, col, element }
    let endNode = null; // { row, col, element }
    let currentMode = 'start'; // 'start', 'end', or 'wall'
    let isDrawing = false;
    let isSolving = false;
    let visualizationSpeed = 50;

    // --- 3. Grid Creation ---
    function createGrid() {
        gridContainer.innerHTML = '';
        grid = [];
        for (let r = 0; r < ROWS; r++) {
            const rowArr = [];
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                gridContainer.appendChild(cell);
                // 0 = empty, 1 = wall
                rowArr.push({ element: cell, isWall: false, isVisited: false });
            }
            grid.push(rowArr);
        }
    }

    // --- 4. Event Handlers ---
    function handleCellClick(e) {
        if (isSolving || !e.target.classList.contains('cell')) return;
        
        // --- FIX ADDED: Clear old path when grid is clicked ---
        if (!isSolving) clearPath();
        // --------------------------------------------------

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        switch (currentMode) {
            case 'start':
                setStartNode(row, col);
                break;
            case 'end':
                setEndNode(row, col);
                break;
            case 'wall':
                toggleWall(row, col);
                break;
        }
    }

    function handleMouseDown(e) {
        if (currentMode === 'wall') {
            
            // --- FIX ADDED: Clear old path when drawing walls ---
            if (!isSolving) clearPath();
            // ----------------------------------------------------

            isDrawing = true;
            handleCellClick(e);
        }
    }

    function handleMouseOver(e) {
        if (isDrawing && currentMode === 'wall' && e.target.classList.contains('cell')) {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            if (!grid[row][col].isWall) { // Only draw, don't erase on drag
                toggleWall(row, col);
            }
        }
    }

    function handleMouseUp() {
        isDrawing = false;
    }

    function setStartNode(row, col) {
        if (grid[row][col].isWall || (endNode && endNode.row === row && endNode.col === col)) return;
        
        // Clear old start node
        if (startNode) {
            startNode.element.classList.remove('start');
        }
        // Set new start node
        startNode = { row, col, element: grid[row][col].element };
        startNode.element.classList.add('start');
    }

    function setEndNode(row, col) {
        if (grid[row][col].isWall || (startNode && startNode.row === row && startNode.col === col)) return;

        // Clear old end node
        if (endNode) {
            endNode.element.classList.remove('end');
        }
        // Set new end node
        endNode = { row, col, element: grid[row][col].element };
        endNode.element.classList.add('end');
    }

    function toggleWall(row, col) {
        if ((startNode && startNode.row === row && startNode.col === col) ||
            (endNode && endNode.row === row && endNode.col === col)) {
            return; // Don't allow walls on start/end
        }
        
        const cell = grid[row][col];
        cell.isWall = !cell.isWall;
        cell.element.classList.toggle('wall', cell.isWall);
    }

    function setMode(mode) {
        currentMode = mode;
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `set-${mode}-btn`) {
                btn.classList.add('active');
            }
        });
    }

    function clearPath() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                grid[r][c].isVisited = false;
                grid[r][c].element.classList.remove('visited', 'path');
            }
        }
    }

    function clearWalls() {
        if (isSolving) return;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].isWall) {
                    grid[r][c].isWall = false;
                    grid[r][c].element.classList.remove('wall');
                }
            }
        }
        clearPath();
    }

    function resetGrid() {
        startNode = null;
        endNode = null;
        isSolving = false;
        setMode('start');
        createGrid();
    }

    // --- 5. DFS Algorithm ---
    async function solveDFS() {
        if (!startNode || !endNode) {
            alert("Please set a Start and End node.");
            return;
        }
        if (isSolving) return;

        isSolving = true;
        clearPath();
        toggleControls(false);

        const stack = [];
        const parentMap = new Map(); // Stores {node: parent} to reconstruct path
        
        // Add start node to stack
        stack.push(startNode);
        grid[startNode.row][startNode.col].isVisited = true;

        let pathFound = false;

        while (stack.length > 0) {
            const current = stack.pop();

            // --- Visualization ---
            if (current !== startNode) { 
                current.element.classList.add('visited');
                await sleep(visualizationSpeed);
            }
            
            // --- Goal Check ---
            if (current.row === endNode.row && current.col === endNode.col) {
                pathFound = true;
                break;
            }

            // --- Get Neighbors (Up, Down, Left, Right) ---
            const neighbors = getNeighbors(current.row, current.col);

            for (const neighbor of neighbors) {
                const { row, col } = neighbor;
                
                if (!grid[row][col].isVisited && !grid[row][col].isWall) {
                    grid[row][col].isVisited = true;
                    parentMap.set(neighbor, current); // Store parent
                    stack.push(neighbor); // Push to stack
                }
            }
        }

        if (pathFound) {
            await reconstructPath(parentMap);
            // --- ALERT ADDED HERE ---
            alert("Path Found! The endpoint has been reached.");
            // --------------------------
        } else {
            alert("No path found!");
        }

        isSolving = false;
        toggleControls(true);
    }

    function getNeighbors(row, col) {
        const neighbors = [];
        // [row, col]
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;

            // Check if in bounds
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                neighbors.push({ row: r, col: c, element: grid[r][c].element });
            }
        }
        return neighbors;
    }

    async function reconstructPath(parentMap) {
        let current = endNode;
        const path = [];
        
        while (current !== startNode) {
            path.push(current);
            // Find the parent of the current node
            current = parentMap.get(current);
            if (!current) break; 
        }
        
        path.reverse(); 

        for (const node of path) {
            if (node !== endNode) { 
                node.element.classList.add('path');
                await sleep(Math.max(10, visualizationSpeed / 2));
            }
        }
    }

    // --- 6. Helper Functions ---
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function toggleControls(enabled) {
        solveBtn.disabled = !enabled;
        resetBtn.disabled = !enabled;
        clearWallsBtn.disabled = !enabled;
        modeButtons.forEach(btn => btn.disabled = !enabled);
        speedSlider.disabled = !enabled;
    }

    // --- 7. Initialization ---
    function init() {
        createGrid();
        
        // Control listeners
        solveBtn.addEventListener('click', solveDFS);
        resetBtn.addEventListener('click', resetGrid);
        clearWallsBtn.addEventListener('click', clearWalls);
        speedSlider.addEventListener('input', (e) => visualizationSpeed = 210 - e.target.value);
        
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.id === 'set-start-btn') setMode('start');
                else if (btn.id === 'set-end-btn') setMode('end');
                else if (btn.id === 'set-wall-btn') setMode('wall');
            });
        });

        // Grid listeners
        gridContainer.addEventListener('mousedown', handleMouseDown);
        gridContainer.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseup', handleMouseUp); // Listen on document
        gridContainer.addEventListener('click', handleCellClick);
    }

    init();
});