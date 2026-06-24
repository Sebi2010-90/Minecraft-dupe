// Mobile Controls System
class MobileControls {
    constructor(game) {
        this.game = game;
        this.isTouch = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Joystick states
        this.leftJoystick = { x: 0, y: 0, active: false };
        this.rightJoystick = { x: 0, y: 0, active: false };
        
        // Joystick configs
        this.joystickRadius = 50;
        this.joystickDeadzone = 10;
        
        // Check if device is touch
        this.detectTouchDevice();
        
        if (this.isTouch) {
            this.setupMobileUI();
            this.setupTouchControls();
        }
    }
    
    detectTouchDevice() {
        this.isTouch = () => {
            return (('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0));
        };
        this.isTouch = this.isTouch();
    }
    
    setupMobileUI() {
        // Create mobile controls container
        const container = document.createElement('div');
        container.id = 'mobile-controls';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            pointer-events: none;
            z-index: 50;
        `;
        
        // Left joystick container
        const leftContainer = document.createElement('div');
        leftContainer.id = 'left-joystick-container';
        leftContainer.style.cssText = `
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(76, 175, 80, 0.5);
            border-radius: 50%;
            position: relative;
            pointer-events: auto;
            touch-action: none;
        `;
        
        const leftKnob = document.createElement('div');
        leftKnob.id = 'left-joystick-knob';
        leftKnob.style.cssText = `
            width: 60px;
            height: 60px;
            background: rgba(76, 175, 80, 0.7);
            border: 2px solid rgba(76, 175, 80, 1);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        `;
        leftContainer.appendChild(leftKnob);
        
        // Right joystick container (look)
        const rightContainer = document.createElement('div');
        rightContainer.id = 'right-joystick-container';
        rightContainer.style.cssText = `
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(76, 175, 80, 0.5);
            border-radius: 50%;
            position: relative;
            pointer-events: auto;
            touch-action: none;
        `;
        
        const rightKnob = document.createElement('div');
        rightKnob.id = 'right-joystick-knob';
        rightKnob.style.cssText = `
            width: 60px;
            height: 60px;
            background: rgba(76, 175, 80, 0.7);
            border: 2px solid rgba(76, 175, 80, 1);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        `;
        rightContainer.appendChild(rightKnob);
        
        // Action buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            flex-direction: column;
            pointer-events: auto;
            z-index: 50;
        `;
        
        // Jump button
        const jumpBtn = this.createButton('JUMP', () => {
            this.game.input.jump = true;
            setTimeout(() => { this.game.input.jump = false; }, 100);
        });
        jumpBtn.style.backgroundColor = 'rgba(76, 175, 80, 0.7)';
        
        // Attack button (left click)
        const attackBtn = this.createButton('ATTACK', () => {
            this.game.input.leftClick = true;
            setTimeout(() => { this.game.input.leftClick = false; }, 100);
        });
        attackBtn.style.backgroundColor = 'rgba(255, 68, 68, 0.7)';
        
        // Place button (right click)
        const placeBtn = this.createButton('PLACE', () => {
            this.game.input.rightClick = true;
            setTimeout(() => { this.game.input.rightClick = false; }, 100);
        });
        placeBtn.style.backgroundColor = 'rgba(68, 150, 255, 0.7)';
        
        // Block selection buttons
        const blockSelectContainer = document.createElement('div');
        blockSelectContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            display: grid;
            grid-template-columns: repeat(3, 50px);
            gap: 8px;
            pointer-events: auto;
            z-index: 50;
        `;
        
        for (let i = 1; i <= 9; i++) {
            const blockBtn = this.createButton(i.toString(), () => {
                this.game.player.selectBlock(i - 1);
            }, 40);
            blockBtn.style.fontSize = '12px';
            blockBtn.style.padding = '5px';
            blockSelectContainer.appendChild(blockBtn);
        }
        
        buttonsContainer.appendChild(jumpBtn);
        buttonsContainer.appendChild(attackBtn);
        buttonsContainer.appendChild(placeBtn);
        
        container.appendChild(leftContainer);
        container.appendChild(rightContainer);
        
        document.body.appendChild(container);
        document.body.appendChild(buttonsContainer);
        document.body.appendChild(blockSelectContainer);
        
        this.leftContainer = leftContainer;
        this.rightContainer = rightContainer;
        this.leftKnob = leftKnob;
        this.rightKnob = rightKnob;
    }
    
    createButton(label, callback, size = 50) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: rgba(76, 175, 80, 0.7);
            border: 2px solid rgba(76, 175, 80, 1);
            border-radius: 8px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            pointer-events: auto;
            touch-action: manipulation;
        `;
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.style.transform = 'scale(0.9)';
            btn.style.opacity = '0.9';
            callback();
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.style.transform = 'scale(1)';
            btn.style.opacity = '1';
        });
        
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btn.style.transform = 'scale(0.9)';
            btn.style.opacity = '0.9';
            callback();
        });
        
        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            btn.style.transform = 'scale(1)';
            btn.style.opacity = '1';
        });
        
        return btn;
    }
    
    setupTouchControls() {
        // Left joystick (movement)
        this.setupJoystick(
            this.leftContainer,
            this.leftKnob,
            this.leftJoystick,
            (dx, dy) => {
                // dx: right/left, dy: down/up
                this.game.input.right = dx > this.joystickDeadzone ? true : false;
                this.game.input.left = dx < -this.joystickDeadzone ? true : false;
                this.game.input.forward = dy < -this.joystickDeadzone ? true : false;
                this.game.input.backward = dy > this.joystickDeadzone ? true : false;
            }
        );
        
        // Right joystick (look/camera)
        this.setupJoystick(
            this.rightContainer,
            this.rightKnob,
            this.rightJoystick,
            (dx, dy) => {
                const sensitivity = 0.05;
                this.game.player.yaw -= dx * sensitivity;
                this.game.player.pitch -= dy * sensitivity;
                this.game.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.game.player.pitch));
            }
        );
    }
    
    setupJoystick(container, knob, joystick, callback) {
        const rect = container.getBoundingClientRect();
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        
        const handleTouchMove = (e, touch) => {
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            let dx = touchX - centerX;
            let dy = touchY - centerY;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = this.joystickRadius;
            
            if (distance > maxDistance) {
                const angle = Math.atan2(dy, dx);
                dx = Math.cos(angle) * maxDistance;
                dy = Math.sin(angle) * maxDistance;
            }
            
            joystick.x = dx;
            joystick.y = dy;
            
            knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            callback(dx, dy);
        };
        
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            joystick.active = true;
            const touch = e.touches[0];
            handleTouchMove(e, touch);
        });
        
        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (joystick.active) {
                const touch = e.touches[0];
                handleTouchMove(e, touch);
            }
        });
        
        const resetJoystick = () => {
            joystick.active = false;
            joystick.x = 0;
            joystick.y = 0;
            knob.style.transform = 'translate(-50%, -50%)';
            
            // Reset movement
            this.game.input.forward = false;
            this.game.input.backward = false;
            this.game.input.left = false;
            this.game.input.right = false;
        };
        
        container.addEventListener('touchend', (e) => {
            e.preventDefault();
            resetJoystick();
        });
        
        container.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            resetJoystick();
        });
        
        // Mouse support for testing
        container.addEventListener('mousedown', (e) => {
            e.preventDefault();
            joystick.active = true;
            handleTouchMove(e, e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (joystick.active) {
                handleTouchMove(e, e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            resetJoystick();
        });
    }
    
    update() {
        // Update is called from game loop if needed
        // Currently joysticks update input directly via callbacks
    }
}
