// IME Optimizer Demo Script
document.addEventListener('DOMContentLoaded', function() {
    // Demo toggle functionality
    const demoToggle = document.getElementById('demoToggle');
    const demoForm = document.querySelector('.demo-form');
    
    if (demoToggle && demoForm) {
        // Initial state
        updateDemoState(demoToggle.checked);
        
        // Toggle event listener
        demoToggle.addEventListener('change', function() {
            updateDemoState(this.checked);
        });
    }
    
    // Field icon click handlers
    const fieldIcons = document.querySelectorAll('.field-icon');
    fieldIcons.forEach(icon => {
        icon.addEventListener('click', handleFieldIconClick);
    });
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animations
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Hero section is always visible
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.opacity = '1';
        heroSection.style.transform = 'translateY(0)';
    }
});

function updateDemoState(isActive) {
    const demoForm = document.querySelector('.demo-form');
    const fieldIcons = document.querySelectorAll('.field-icon');
    const inputs = document.querySelectorAll('.demo-form input[type="text"], .demo-form input[type="password"]');
    
    if (isActive) {
        demoForm.classList.add('demo-active');
        demoForm.classList.remove('demo-inactive');
        
        // Apply appropriate input modes and types based on data attributes
        inputs.forEach(input => {
            const fieldType = input.getAttribute('data-type');
            applyFieldOptimization(input, fieldType);
        });
        
        // Show icons
        fieldIcons.forEach(icon => {
            icon.style.opacity = '1';
        });
        
    } else {
        demoForm.classList.add('demo-inactive');
        demoForm.classList.remove('demo-active');
        
        // Reset to default state (simulate bad IME control)
        inputs.forEach(input => {
            input.style.borderColor = '#ff6b6b';
            input.style.backgroundColor = '#ffebee';
        });
        
        // Hide icons
        fieldIcons.forEach(icon => {
            icon.style.opacity = '0.3';
        });
    }
}

function applyFieldOptimization(input, fieldType) {
    // Simulate the extension's behavior
    switch (fieldType) {
        case 'email':
        case 'tel':
        case 'postal':
        case 'card':
        case 'security':
        case 'url':
            // These should have IME OFF
            input.style.borderColor = '#4CAF50';
            input.style.backgroundColor = '#f1f8e9';
            input.setAttribute('inputmode', getInputMode(fieldType));
            break;
            
        case 'name':
        case 'kana':
        case 'address':
        case 'comment':
        case 'search':
            // These should have IME ON for Japanese
            input.style.borderColor = '#4CAF50';
            input.style.backgroundColor = '#f1f8e9';
            input.setAttribute('inputmode', 'text');
            break;
            
        case 'date':
            input.style.borderColor = '#4CAF50';
            input.style.backgroundColor = '#f1f8e9';
            input.setAttribute('inputmode', 'numeric');
            break;
            
        case 'password':
            input.style.borderColor = '#4CAF50';
            input.style.backgroundColor = '#f1f8e9';
            break;
            
        default:
            input.style.borderColor = '#e1e8ed';
            input.style.backgroundColor = '#fff';
    }
}

function getInputMode(fieldType) {
    const inputModes = {
        'email': 'email',
        'tel': 'tel',
        'postal': 'numeric',
        'card': 'numeric',
        'security': 'numeric',
        'url': 'url',
        'date': 'numeric'
    };
    
    return inputModes[fieldType] || 'text';
}

function handleFieldIconClick(event) {
    const icon = event.target;
    const inputContainer = icon.closest('.input-with-icon');
    const input = inputContainer ? inputContainer.querySelector('input') : null;
    
    if (!input) return;
    
    // Simulate custom setting dialog
    const fieldType = input.getAttribute('data-type');
    const currentEmoji = icon.getAttribute('data-emoji');
    
    // Create a simple modal-like experience
    const newSetting = prompt(
        `フィールドの設定を変更:\n\n` +
        `現在の推測: ${getFieldTypeLabel(fieldType)}\n\n` +
        `新しい設定を選択してください:\n` +
        `1: 日本語入力 (📝)\n` +
        `2: メールアドレス (📧)\n` +
        `3: 電話番号 (📞)\n` +
        `4: 数値 (🔢)\n` +
        `5: URL (🔗)\n` +
        `6: パスワード (🔒)\n` +
        `7: 検索 (🔍)\n` +
        `8: 日付 (📅)\n` +
        `9: カード番号 (💳)`,
        '1'
    );
    
    if (newSetting && newSetting.match(/^[1-9]$/)) {
        const newType = getTypeFromChoice(newSetting);
        const newEmoji = getEmojiFromType(newType);
        
        // Update the field
        input.setAttribute('data-type', newType);
        icon.textContent = newEmoji;
        icon.setAttribute('data-emoji', newEmoji);
        icon.setAttribute('data-tooltip', `${getFieldTypeLabel(newType)} (カスタム設定)`);
        
        // Apply the new optimization
        applyFieldOptimization(input, newType);
        
        // Visual feedback
        icon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    }
}

function getFieldTypeLabel(fieldType) {
    const labels = {
        'name': '日本語入力',
        'kana': '日本語入力',
        'email': 'メールアドレス',
        'tel': '電話番号',
        'postal': '数値入力',
        'address': '日本語入力',
        'card': 'カード番号',
        'date': '日付入力',
        'security': '数値入力',
        'url': 'URL入力',
        'search': '検索入力',
        'password': 'パスワード',
        'comment': '日本語入力'
    };
    
    return labels[fieldType] || '不明';
}


function getTypeFromChoice(choice) {
    const choices = {
        '1': 'name',
        '2': 'email',
        '3': 'tel',
        '4': 'postal',
        '5': 'url',
        '6': 'password',
        '7': 'search',
        '8': 'date',
        '9': 'card'
    };
    
    return choices[choice] || 'name';
}

function getEmojiFromType(fieldType) {
    const emojis = {
        'name': '📝',
        'kana': '📝',
        'email': '📧',
        'tel': '📞',
        'postal': '🔢',
        'address': '📝',
        'card': '💳',
        'date': '📅',
        'security': '🔢',
        'url': '🔗',
        'search': '🔍',
        'password': '🔒',
        'comment': '📝'
    };
    
    return emojis[fieldType] || '📝';
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Counter animation for stats
    const stats = document.querySelectorAll('.stat-number');
    const animateCounter = (element, target) => {
        let count = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(count);
            }
        }, 20);
    };
    
    // Observe stats for counter animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.textContent);
                if (!element.classList.contains('animated')) {
                    element.classList.add('animated');
                    animateCounter(element, target);
                }
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.icon-item, .security-item, .ui-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});