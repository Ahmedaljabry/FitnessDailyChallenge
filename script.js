document.addEventListener('DOMContentLoaded', () => {
    const challenges = [
        { id: 1, name: '10-Minute Walk', description: 'Get up and walk for 10 minutes, either outdoors or indoors.' },
        { id: 2, name: '20 Push-ups', description: 'Do 20 push-ups. You can do them on your knees if needed.' },
        { id: 3, name: '30-Second Plank', description: 'Hold a plank position for 30 seconds.' },
        { id: 4, name: '15 Squats', description: 'Perform 15 bodyweight squats.' },
        { id: 5, name: '5-Minute Stretch', description: 'Take 5 minutes to stretch your major muscle groups.' },
        { id: 6, name: '20 Lunges', description: '10 per leg. Keep your core engaged.' },
        { id: 7, name: '1-Minute High Knees', description: 'Run in place, bringing your knees up high.' },
        { id: 8, name: '10 Burpees', description: 'A full-body exercise to get your heart rate up.' },
        { id: 9, name: '3-Minute Meditation', description: 'Sit quietly and focus on your breath.' },
        { id: 10, name: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day.' }
    ];

    const App = {
        init() {
            this.cacheDOMElements();
            this.loadState();
            this.handlePageSpecificLogic();
            this.updateActiveNav();
        },

        cacheDOMElements() {
            this.page = window.location.pathname.split('/').pop();
        },

        loadState() {
            const today = new Date().toISOString().split('T')[0];
            this.state = JSON.parse(localStorage.getItem('fitnessProgress')) || {
                completedTotal: 0,
                streak: 0,
                lastCompletedDate: null,
                completedChallenges: [], // { id, name, date }
                dailyChallenge: null,
                rerollsToday: 0,
                lastRerollDate: null
            };

            // Reset daily challenge and rerolls if it's a new day
            if (this.state.lastCompletedDate !== today) {
                this.state.dailyChallenge = null;
            }
            if (this.state.lastRerollDate !== today) {
                this.state.rerollsToday = 0;
            }
        },

        saveState() {
            localStorage.setItem('fitnessProgress', JSON.stringify(this.state));
        },

        getNewChallenge() {
            const availableChallenges = challenges.filter(c => 
                !this.state.completedChallenges.some(cc => cc.id === c.id && cc.date === new Date().toISOString().split('T')[0])
            );
            if (availableChallenges.length === 0) return null; // All challenges done for today
            const randomIndex = Math.floor(Math.random() * availableChallenges.length);
            return availableChallenges[randomIndex];
        },

        handlePageSpecificLogic() {
            switch (this.page) {
                case 'index.html':
                case '':
                    this.initHomePage();
                    break;
                case 'profile.html':
                    this.initProfilePage();
                    break;
                case 'challenges.html':
                    this.initChallengesPage();
                    break;
            }
        },

        initHomePage() {
            const challengeContainer = document.getElementById('challenge-container');
            const completeButton = document.getElementById('complete-challenge');
            const rerollButton = document.getElementById('reroll-challenge');

            if (!this.state.dailyChallenge) {
                this.state.dailyChallenge = this.getNewChallenge();
                this.saveState();
            }

            const displayChallenge = (challenge) => {
                if (challenge) {
                    challengeContainer.innerHTML = `<h3>${challenge.name}</h3><p>${challenge.description}</p>`;
                } else {
                    challengeContainer.innerHTML = `<h3>Congratulations!</h3><p>You've completed all available challenges for today!</p>`;
                    completeButton.style.display = 'none';
                    rerollButton.style.display = 'none';
                }
            };

            displayChallenge(this.state.dailyChallenge);

            const today = new Date().toISOString().split('T')[0];
            if (this.state.completedChallenges.some(c => c.id === this.state.dailyChallenge?.id && c.date === today)) {
                completeButton.disabled = true;
                completeButton.innerHTML = `<i class="fas fa-check"></i> Completed`;
            }

            completeButton.addEventListener('click', () => {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (this.state.lastCompletedDate === yesterday) {
                    this.state.streak++;
                } else if (this.state.lastCompletedDate !== today) {
                    this.state.streak = 1;
                }

                this.state.completedTotal++;
                this.state.lastCompletedDate = today;
                this.state.completedChallenges.push({ ...this.state.dailyChallenge, date: today });
                
                this.saveState();
                completeButton.disabled = true;
                completeButton.innerHTML = `<i class="fas fa-check"></i> Completed`;
            });

            rerollButton.addEventListener('click', () => {
                const REROLL_LIMIT = 3;
                const today = new Date().toISOString().split('T')[0];

                if (this.state.lastRerollDate !== today) {
                    this.state.rerollsToday = 0;
                    this.state.lastRerollDate = today;
                }

                if (this.state.rerollsToday < REROLL_LIMIT) {
                    this.state.rerollsToday++;
                    this.state.dailyChallenge = this.getNewChallenge();
                    displayChallenge(this.state.dailyChallenge);
                    this.saveState();
                    if (this.state.rerollsToday === REROLL_LIMIT) {
                        rerollButton.disabled = true;
                        rerollButton.innerHTML = `<i class="fas fa-sync-alt"></i> No Rerolls Left`;
                    }
                } else {
                    rerollButton.disabled = true;
                    rerollButton.innerHTML = `<i class="fas fa-sync-alt"></i> No Rerolls Left`;
                }
            });
        },

        initProfilePage() {
            const statsContainer = document.getElementById('stats-container');
            const completedList = document.getElementById('completed-list');

            statsContainer.innerHTML = `
                <div class="stat-item"><h3>Total Completed</h3><p>${this.state.completedTotal}</p></div>
                <div class="stat-item"><h3>Current Streak</h3><p>${this.state.streak} Days</p></div>
            `;

            if (this.state.completedChallenges.length > 0) {
                this.state.completedChallenges.forEach(challenge => {
                    const li = document.createElement('li');
                    li.textContent = `${challenge.name} (Completed on ${challenge.date})`;
                    completedList.appendChild(li);
                });
            } else {
                completedList.innerHTML = '<li>No challenges completed yet. Go get one!</li>';
            }
        },

        initChallengesPage() {
            const challengesList = document.getElementById('challenges-list');
            challenges.forEach(challenge => {
                const card = document.createElement('div');
                card.className = 'challenge-card';
                card.innerHTML = `<h3>${challenge.name}</h3><p>${challenge.description}</p>`;
                challengesList.appendChild(card);
            });
        },

        updateActiveNav() {
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === this.page || (this.page === '' && link.getAttribute('href') === 'index.html')) {
                    link.classList.add('active');
                }
            });
        }
    };

    App.init();
});
