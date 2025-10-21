document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-anim-btn');
    const stackContainer = document.getElementById('anim-stack');
    let isPlaying = false;

    // A "script" for the animation to follow
    // Each frame defines the cell to visit, the action, and the stack's state
    const animationScript = [
        { cell: 'a0', action: 'visit', stack: ['(0,0)'], note: 'Start at (0,0). Push to stack.' },
        { cell: 'a3', action: 'visit', stack: ['(0,0)', '(1,0)'], note: 'Explore Down to (1,0). Push.' },
        { cell: 'a6', action: 'visit', stack: ['(0,0)', '(1,0)', '(2,0)'], note: 'Explore Down to (2,0). Push.' },
        { cell: 'a6', action: 'pop', stack: ['(0,0)', '(1,0)'], note: 'Dead end. Pop (2,0).' },
        { cell: 'a4', action: 'visit', stack: ['(0,0)', '(1,0)', '(1,1)'], note: 'Backtrack to (1,0), explore Right to (1,1). Push.' },
        { cell: 'a1', action: 'visit', stack: ['(0,0)', '(1,0)', '(1,1)', '(0,1)'], note: 'Explore Up to (0,1). Push.' },
        { cell: 'a1', action: 'pop', stack: ['(0,0)', '(1,0)', '(1,1)'], note: 'Dead end. Pop (0,1).' },
        { cell: 'a5', action: 'visit', stack: ['(0,0)', '(1,0)', '(1,1)', '(1,2)'], note: 'Backtrack to (1,1), explore Right to (1,2). Push.' },
        { cell: 'a8', action: 'visit', stack: ['(0,0)', '(1,0)', '(1,1)', '(1,2)', '(2,2)'], note: 'Explore Down to (2,2). Push.' },
        { cell: 'a8', action: 'pop', stack: ['(0,0)', '(1,0)', '(1,1)', '(1,2)'], note: 'Dead end. Pop (2,2).' },
        { cell: 'a7', action: 'path', stack: ['(0,0)', '(1,0)', '(1,1)', '(1,2)', '(2,1)'], note: 'Backtrack to (1,2), explore Down to (2,1). Goal!' },
    ];

    playBtn.addEventListener('click', () => {
        if (isPlaying) return;
        isPlaying = true;
        playBtn.disabled = true;
        playAnimation();
    });

    function resetAnimation() {
        // Clear all cell styles
        document.querySelectorAll('.anim-cell').forEach(cell => {
            cell.classList.remove('visited', 'current', 'pop', 'path');
        });
        // Clear stack
        stackContainer.innerHTML = '';
        // Reset start/end
        document.getElementById('a0').classList.add('start');
        document.getElementById('a7').classList.add('end');
    }

    async function playAnimation() {
        resetAnimation();
        let step = 0;

        function nextStep() {
            if (step >= animationScript.length) {
                isPlaying = false;
                playBtn.disabled = false;
                // Clear the last 'current'
                document.querySelectorAll('.anim-cell.current').forEach(c => c.classList.remove('current'));
                return;
            }

            // Clear previous step's effects
            document.querySelectorAll('.anim-cell.current').forEach(c => c.classList.remove('current'));
            document.querySelectorAll('.anim-cell.pop').forEach(c => c.classList.remove('pop'));

            const frame = animationScript[step];
            const cell = document.getElementById(frame.cell);

            // Apply new effects
            cell.classList.add('current');
            if (frame.action === 'visit') {
                cell.classList.add('visited');
            } else if (frame.action === 'pop') {
                cell.classList.add('pop');
                cell.classList.remove('visited'); // Show the backtrack
            } else if (frame.action === 'path') {
                cell.classList.add('path');
            }
            
            // Update stack UI
            updateStack(frame.stack, frame.action === 'pop');

            step++;
            setTimeout(nextStep, 900); // 0.9 second delay per step
        }

        nextStep(); // Start the sequence
    }

    function updateStack(stackItems, isPopping) {
        stackContainer.innerHTML = '';
        if (stackItems.length === 0) {
            stackContainer.innerHTML = '<div class="stack-item empty">Stack is empty</div>';
            return;
        }

        stackItems.forEach((item, index) => {
            const stackEl = document.createElement('div');
            stackEl.classList.add('stack-item');
            stackEl.textContent = item;
            
            // Highlight the top of the stack
            if (index === stackItems.length - 1) {
                stackEl.classList.add('stack-top');
                if (isPopping) {
                    stackEl.classList.add('pop'); // Add pop animation
                }
            }
            stackContainer.prepend(stackEl); // Prepend to show stack (top is at the top)
        });
    }

    // Initialize on load
    resetAnimation();
});