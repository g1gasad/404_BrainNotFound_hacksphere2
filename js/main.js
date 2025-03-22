document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    const authButtons = document.querySelector('.auth-buttons');
    const languageSelector = document.querySelector('.language-selector');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Create mobile nav if it doesn't exist
            if (!document.querySelector('.mobile-nav')) {
                const mobileNav = document.createElement('div');
                mobileNav.className = 'mobile-nav';
                
                // Clone navigation
                const navClone = nav.cloneNode(true);
                mobileNav.appendChild(navClone);
                
                // Clone auth buttons
                const authClone = authButtons.cloneNode(true);
                mobileNav.appendChild(authClone);
                
                // Clone language selector
                const langClone = languageSelector.cloneNode(true);
                mobileNav.appendChild(langClone);
                
                // Append to header
                document.querySelector('.header .container').appendChild(mobileNav);
                
                // Add styles
                mobileNav.style.display = 'none';
                mobileNav.style.flexDirection = 'column';
                mobileNav.style.width = '100%';
                mobileNav.style.marginTop = '20px';
                
                navClone.querySelector('ul').style.flexDirection = 'column';
                navClone.querySelectorAll('li').forEach(li => {
                    li.style.margin = '10px 0';
                });
                
                authClone.style.marginTop = '20px';
                langClone.style.marginTop = '20px';
                langClone.style.marginLeft = '0';
            }
            
            // Toggle mobile nav
            const mobileNav = document.querySelector('.mobile-nav');
            if (mobileNav) {
                if (mobileNav.style.display === 'none' || mobileNav.style.display === '') {
                    mobileNav.style.display = 'flex';
                    // Transform burger to X
                    mobileToggle.querySelectorAll('span')[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    mobileToggle.querySelectorAll('span')[1].style.opacity = '0';
                    mobileToggle.querySelectorAll('span')[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    mobileNav.style.display = 'none';
                    // Reset burger
                    mobileToggle.querySelectorAll('span').forEach(span => {
                        span.style.transform = 'none';
                        span.style.opacity = '1';
                    });
                }
            }
        });
    }
    
    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentTestimonial = 0;
    
    if (testimonials.length > 0) {
        // Hide all testimonials except the first one
        testimonials.forEach((testimonial, index) => {
            if (index !== 0) {
                testimonial.style.display = 'none';
            }
        });
        
        // Function to show testimonial
        function showTestimonial(index) {
            testimonials.forEach(testimonial => {
                testimonial.style.display = 'none';
            });
            testimonials[index].style.display = 'flex';
            
            // Handle responsive design
            if (window.innerWidth <= 992) {
                testimonials[index].style.display = 'block';
            }
        }
        
        // Event listeners for slider controls
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', function() {
                currentTestimonial--;
                if (currentTestimonial < 0) {
                    currentTestimonial = testimonials.length - 1;
                }
                showTestimonial(currentTestimonial);
            });
            
            nextBtn.addEventListener('click', function() {
                currentTestimonial++;
                if (currentTestimonial >= testimonials.length) {
                    currentTestimonial = 0;
                }
                showTestimonial(currentTestimonial);
            });
        }
        
        // Auto-slide every 5 seconds
        setInterval(function() {
            currentTestimonial++;
            if (currentTestimonial >= testimonials.length) {
                currentTestimonial = 0;
            }
            showTestimonial(currentTestimonial);
        }, 5000);
        
        // Update display on window resize
        window.addEventListener('resize', function() {
            showTestimonial(currentTestimonial);
        });
    }
    
    // Language Selector
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            // This would be implemented with a proper translation system
            // For demonstration purposes, we'll just show an alert
            alert(`Language changed to ${selectedLanguage}. In a real implementation, this would translate the page content.`);
        });
    }
    
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // AI Chatbot Simulation
    const chatbotButton = document.createElement('div');
    chatbotButton.className = 'chatbot-button';
    chatbotButton.innerHTML = '<i class="fas fa-comment-dots"></i>';
    document.body.appendChild(chatbotButton);
    
    // Style chatbot button
    chatbotButton.style.position = 'fixed';
    chatbotButton.style.bottom = '20px';
    chatbotButton.style.right = '20px';
    chatbotButton.style.width = '60px';
    chatbotButton.style.height = '60px';
    chatbotButton.style.borderRadius = '50%';
    chatbotButton.style.backgroundColor = 'var(--primary-color)';
    chatbotButton.style.color = 'white';
    chatbotButton.style.display = 'flex';
    chatbotButton.style.alignItems = 'center';
    chatbotButton.style.justifyContent = 'center';
    chatbotButton.style.fontSize = '24px';
    chatbotButton.style.boxShadow = 'var(--shadow)';
    chatbotButton.style.cursor = 'pointer';
    chatbotButton.style.zIndex = '999';
    
    // Create chatbot panel
    const chatbotPanel = document.createElement('div');
    chatbotPanel.className = 'chatbot-panel';
    chatbotPanel.innerHTML = `
        <div class="chatbot-header">
            <h3>MaterCare Assistant</h3>
            <button class="close-chatbot"><i class="fas fa-times"></i></button>
        </div>
        <div class="chatbot-messages">
            <div class="bot-message">
                Hello! I'm your maternal care assistant. How can I help you today?
            </div>
        </div>
        <div class="chatbot-input">
            <input type="text" placeholder="Type your question here...">
            <button><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    document.body.appendChild(chatbotPanel);
    
    // Style chatbot panel
    chatbotPanel.style.position = 'fixed';
    chatbotPanel.style.bottom = '90px';
    chatbotPanel.style.right = '20px';
    chatbotPanel.style.width = '350px';
    chatbotPanel.style.height = '450px';
    chatbotPanel.style.borderRadius = '10px';
    chatbotPanel.style.backgroundColor = 'white';
    chatbotPanel.style.boxShadow = 'var(--shadow)';
    chatbotPanel.style.display = 'none';
    chatbotPanel.style.flexDirection = 'column';
    chatbotPanel.style.overflow = 'hidden';
    chatbotPanel.style.zIndex = '998';
    
    const chatbotHeader = chatbotPanel.querySelector('.chatbot-header');
    chatbotHeader.style.display = 'flex';
    chatbotHeader.style.justifyContent = 'space-between';
    chatbotHeader.style.alignItems = 'center';
    chatbotHeader.style.padding = '15px';
    chatbotHeader.style.backgroundColor = 'var(--primary-color)';
    chatbotHeader.style.color = 'white';
    
    chatbotHeader.querySelector('h3').style.margin = '0';
    chatbotHeader.querySelector('button').style.background = 'none';
    chatbotHeader.querySelector('button').style.border = 'none';
    chatbotHeader.querySelector('button').style.color = 'white';
    chatbotHeader.querySelector('button').style.cursor = 'pointer';
    
    const chatbotMessages = chatbotPanel.querySelector('.chatbot-messages');
    chatbotMessages.style.flex = '1';
    chatbotMessages.style.padding = '15px';
    chatbotMessages.style.overflowY = 'auto';
    
    chatbotMessages.querySelector('.bot-message').style.backgroundColor = '#f0f0f0';
    chatbotMessages.querySelector('.bot-message').style.padding = '10px 15px';
    chatbotMessages.querySelector('.bot-message').style.borderRadius = '18px';
    chatbotMessages.querySelector('.bot-message').style.marginBottom = '10px';
    chatbotMessages.querySelector('.bot-message').style.maxWidth = '80%';
    
    const chatbotInput = chatbotPanel.querySelector('.chatbot-input');
    chatbotInput.style.display = 'flex';
    chatbotInput.style.padding = '15px';
    chatbotInput.style.borderTop = '1px solid #eee';
    
    chatbotInput.querySelector('input').style.flex = '1';
    chatbotInput.querySelector('input').style.padding = '10px 15px';
    chatbotInput.querySelector('input').style.border = '1px solid #ddd';
    chatbotInput.querySelector('input').style.borderRadius = '20px';
    chatbotInput.querySelector('input').style.marginRight = '10px';
    chatbotInput.querySelector('input').style.fontSize = '14px';
    
    chatbotInput.querySelector('button').style.width = '40px';
    chatbotInput.querySelector('button').style.height = '40px';
    chatbotInput.querySelector('button').style.backgroundColor = 'var(--primary-color)';
    chatbotInput.querySelector('button').style.color = 'white';
    chatbotInput.querySelector('button').style.border = 'none';
    chatbotInput.querySelector('button').style.borderRadius = '50%';
    chatbotInput.querySelector('button').style.cursor = 'pointer';
    
    // Toggle chatbot panel
    chatbotButton.addEventListener('click', function() {
        if (chatbotPanel.style.display === 'none') {
            chatbotPanel.style.display = 'flex';
        } else {
            chatbotPanel.style.display = 'none';
        }
    });
    
    // Close chatbot
    chatbotPanel.querySelector('.close-chatbot').addEventListener('click', function() {
        chatbotPanel.style.display = 'none';
    });
    
    // Handle chatbot messages
    const chatInput = chatbotPanel.querySelector('input');
    const sendButton = chatbotPanel.querySelector('button');
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;
        
        // Create user message element
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.textContent = message;
        userMessage.style.backgroundColor = 'var(--primary-color)';
        userMessage.style.color = 'white';
        userMessage.style.padding = '10px 15px';
        userMessage.style.borderRadius = '18px';
        userMessage.style.marginBottom = '10px';
        userMessage.style.maxWidth = '80%';
        userMessage.style.marginLeft = 'auto';
        
        chatbotMessages.appendChild(userMessage);
        chatInput.value = '';
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        // Simulate bot response (would be replaced with actual AI in production)
        setTimeout(function() {
            const botMessage = document.createElement('div');
            botMessage.className = 'bot-message';
            
            // Simple response logic based on keywords
            if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
                botMessage.textContent = 'Hello! How can I assist you with maternal healthcare today?';
            } else if (message.toLowerCase().includes('emergency')) {
                botMessage.textContent = 'If you\'re experiencing an emergency, please use the Emergency Support feature or call your local emergency number immediately.';
            } else if (message.toLowerCase().includes('appointment') || message.toLowerCase().includes('doctor')) {
                botMessage.textContent = 'You can book an appointment with healthcare professionals using our Consultation service. Would you like me to help you navigate to that section?';
            } else if (message.toLowerCase().includes('nutrition') || message.toLowerCase().includes('diet')) {
                botMessage.textContent = 'Proper nutrition is vital during pregnancy. Our Educational Resources section has comprehensive guides on prenatal nutrition. I recommend a balanced diet rich in folate, iron, calcium, and protein.';
            } else {
                botMessage.textContent = 'Thank you for your question. Our team will provide you with more information about this. You can also check our Educational Resources section for more details.';
            }
            
            botMessage.style.backgroundColor = '#f0f0f0';
            botMessage.style.padding = '10px 15px';
            botMessage.style.borderRadius = '18px';
            botMessage.style.marginBottom = '10px';
            botMessage.style.maxWidth = '80%';
            
            chatbotMessages.appendChild(botMessage);
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }, 1000);
    }
    
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Form Validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Check required fields
            this.querySelectorAll('[required]').forEach(field => {
                if (field.value.trim() === '') {
                    isValid = false;
                    field.style.borderColor = 'var(--danger-color)';
                    
                    // Create error message if doesn't exist
                    let errorMessage = field.nextElementSibling;
                    if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                        errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.style.color = 'var(--danger-color)';
                        errorMessage.style.fontSize = '1.2rem';
                        errorMessage.style.marginTop = '5px';
                        field.parentNode.insertBefore(errorMessage, field.nextSibling);
                    }
                    errorMessage.textContent = 'This field is required';
                } else {
                    field.style.borderColor = '';
                    const errorMessage = field.nextElementSibling;
                    if (errorMessage && errorMessage.classList.contains('error-message')) {
                        errorMessage.textContent = '';
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}); 
