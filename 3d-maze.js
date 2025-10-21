/* * This file creates the 3D rotating maze for the homepage.
 * It uses the Three.js library.
 */
document.addEventListener('DOMContentLoaded', () => {

    // 1. Find the container
    const container = document.getElementById('three-container');
    if (!container) return;

    // 2. Setup Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true for transparent bg
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 3. Add Lighting
    const ambientLight = new THREE.AmbientLight(0x6091C1, 1.5); // Use accent color
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // 4. Create Maze Geometry
    const maze = new THREE.Group();
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xFAFAFA }); // White walls
    const wallSize = 1;
    const mazeSize = 10; // 10x10 grid
    
    // Create a simple, non-random maze pattern
    for (let i = 0; i < mazeSize; i++) {
        for (let j = 0; j < mazeSize; j++) {
            // Add a floor
            if (i === 0 || j === 0 || i === mazeSize - 1 || j === mazeSize - 1 || (i % 2 === 0 && j % 2 === 0)) {
                // This is a simple pattern, not a real maze
                if (Math.random() > 0.25) { // Randomly skip some blocks to make it look "maze-like"
                    const wallGeometry = new THREE.BoxGeometry(wallSize, wallSize, wallSize);
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    
                    // Position the wall in the grid
                    wall.position.set(
                        i - mazeSize / 2, // Center x
                        j - mazeSize / 2, // Center y
                        0 // z-position
                    );
                    maze.add(wall);
                }
            }
        }
    }

    // Add a base plate
    const baseGeometry = new THREE.BoxGeometry(mazeSize + wallSize, mazeSize + wallSize, 0.5);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a2e, transparent: true, opacity: 0.5 }); // Dark base
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0, -wallSize);
    maze.add(base);

    scene.add(maze);

    // 5. Handle Window Resizing
    function onWindowResize() {
        if (container.clientWidth === 0 || container.clientHeight === 0) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    // 6. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the maze
        maze.rotation.x += 0.001;
        maze.rotation.y += 0.003;
        maze.rotation.z -= 0.002;

        renderer.render(scene, camera);
    }

    // Run the animation and initial resize
    animate();
    onWindowResize(); 
});