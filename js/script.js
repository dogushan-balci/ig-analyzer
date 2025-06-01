document.addEventListener('DOMContentLoaded', function() {
    const followersFile = document.getElementById('followers-file');
    const followingFile = document.getElementById('following-file');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsSection = document.getElementById('results');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const followersInfo = document.getElementById('followers-info');
    const followingInfo = document.getElementById('following-info');

    let followersData = null;
    let followingData = null;

    // File upload handlers
    followersFile.addEventListener('change', function(e) {
        handleFileUpload(e, followersInfo);
        checkFiles();
    });

    followingFile.addEventListener('change', function(e) {
        handleFileUpload(e, followingInfo);
        checkFiles();
    });

    // Analyze button click handler
    analyzeBtn.addEventListener('click', analyzeData);

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Yardım bölümünü aç/kapat
    window.toggleHelp = function() {
        const helpContent = document.getElementById('helpContent');
        helpContent.classList.toggle('active');
    };

    function handleFileUpload(event, infoElement) {
        const file = event.target.files[0];
        if (file) {
            infoElement.textContent = `Selected: ${file.name}`;
            infoElement.style.display = 'inline-block';
        } else {
            infoElement.textContent = '';
            infoElement.style.display = 'none';
        }
    }

    function checkFiles() {
        analyzeBtn.disabled = !(followersFile.files[0] && followingFile.files[0]);
    }

    function analyzeData() {
        const followersPromise = readFile(followersFile.files[0]);
        const followingPromise = readFile(followingFile.files[0]);

        Promise.all([followersPromise, followingPromise])
            .then(([followersData, followingData]) => {
                const followers = extractUsers(followersData);
                const following = extractUsers(followingData);

                const notFollowingBack = following.filter(user => !followers.includes(user));
                const notFollowing = followers.filter(user => !following.includes(user));

                displayResults(followers, following, notFollowingBack, notFollowing);
                resultsSection.style.display = 'block';
            })
            .catch(error => {
                console.error('Error analyzing data:', error);
                alert('An error occurred while analyzing the data. Please try again.');
            });
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    function extractUsers(htmlContent) {
        const users = [];
        const regex = /">([^"<]+)<\/a>/g;
        let match;

        while ((match = regex.exec(htmlContent)) !== null) {
            const username = match[1];
            if (!users.includes(username)) {
                users.push(username);
            }
        }

        return users;
    }

    function displayResults(followers, following, notFollowingBack, notFollowing) {
        displayUserList('not-following-back-list', notFollowingBack);
        displayUserList('not-following-list', notFollowing);
        displayUserList('followers-list', followers);
        displayUserList('following-list', following);
    }

    function displayUserList(elementId, users) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';

        if (users.length === 0) {
            container.innerHTML = '<div class="no-results">No users found</div>';
            return;
        }

        users.forEach(username => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            
            const usernameElement = document.createElement('h4');
            usernameElement.textContent = username;
            
            userInfo.appendChild(usernameElement);
            
            const instagramBtn = document.createElement('a');
            instagramBtn.href = `https://instagram.com/${username}`;
            instagramBtn.target = '_blank';
            instagramBtn.className = 'instagram-btn';
            instagramBtn.title = 'Instagram Profile';
            instagramBtn.innerHTML = '<i class="fab fa-instagram"></i>';
            
            userCard.appendChild(userInfo);
            userCard.appendChild(instagramBtn);
            
            container.appendChild(userCard);
        });
    }

    function switchTab(tabId) {
        // Update tab buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-tab') === tabId) {
                button.classList.add('active');
            }
        });

        // Update tab content
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === tabId) {
                pane.classList.add('active');
            }
        });
    }
}); 