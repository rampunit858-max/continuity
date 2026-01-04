(() => {
  'use strict';

  /* ------------------ Memory Manager ------------------ */
  class MemoryStore {
    constructor(key = 'continuity') {
      this.key = key;
      this.data = JSON.parse(localStorage.getItem(this.key)) || [];
    }

    save() {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    add(text, mood) {
      this.data.push({ text, mood, time: Date.now() });
      this.save();
      return this.data.length - 1;
    }

    remove(index) {
      this.data.splice(index, 1);
      this.save();
    }

    clear() {
      this.data = [];
      localStorage.removeItem(this.key);
    }

    get(index) {
      return this.data[index];
    }

    random() {
      if (!this.data.length) return null;
      const i = Math.floor(Math.random() * this.data.length);
      return { index: i, memory: this.data[i] };
    }
  }

  /* ------------------ DOM ------------------ */
  const textarea = document.getElementById('thought');
  const moodSelect = document.getElementById('mood');
  const saveBtn = document.getElementById('save');
  const clearBtn = document.getElementById('clearAll');
  const memoryBox = document.getElementById('memory');
  const feed = document.getElementById('feed');
  const decision = document.querySelector('.decision');
  const yesBtn = document.getElementById('yes');
  const noBtn = document.getElementById('no');

  const store = new MemoryStore();
  let currentIndex = null;
  let hideTimer = null;

  /* ------------------ Helpers ------------------ */
  const typewriter = (el, text, speed = 30) => {
    el.textContent = '';
    [...text].forEach((c, i) =>
      setTimeout(() => el.textContent += c, i * speed)
    );
  };

  const showMemory = (index) => {
    const mem = store.get(index);
    if (!mem) return;

    currentIndex = index;
    memoryBox.className = '';
    memoryBox.classList.add('show', mem.mood);
    decision.classList.remove('hidden');

    typewriter(memoryBox, mem.text);

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      memoryBox.classList.remove('show');
      decision.classList.add('hidden');
    }, 3000);
  };

  const addToFeed = (memory, index) => {
    const div = document.createElement('div');
    div.className = `memory-item ${memory.mood}`;
    feed.prepend(div);

    let timer;

    const startRemovalTimer = () => {
      timer = setTimeout(() => {
        div.classList.remove('show');
        setTimeout(() => div.remove(), 400);
      }, 5000);
    };

    div.addEventListener('mouseenter', () => clearTimeout(timer));
    div.addEventListener('mouseleave', startRemovalTimer);

    div.addEventListener('click', () => showMemory(index));

    [...memory.text].forEach((c, i) =>
      setTimeout(() => div.textContent += c, i * 20)
    );

    setTimeout(() => div.classList.add('show'), 50);
    startRemovalTimer();
  };

  /* ------------------ Init ------------------ */
  const initial = store.random();
  if (initial) showMemory(initial.index);

  /* ------------------ Events ------------------ */
  saveBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) return;

    const mood = moodSelect.value;
    const index = store.add(text, mood);

    showMemory(index);
    addToFeed(store.get(index), index);

    textarea.value = '';
  });

  yesBtn.addEventListener('click', () => {
    if (currentIndex !== null) showMemory(currentIndex);
  });

  noBtn.addEventListener('click', () => {
    if (currentIndex === null) return;
    store.remove(currentIndex);
    memoryBox.classList.remove('show');
    decision.classList.add('hidden');

    const next = store.random();
    if (next) showMemory(next.index);
    currentIndex = null;
  });

  clearBtn.addEventListener('click', () => {
    store.clear();
    feed.innerHTML = '';
    memoryBox.classList.remove('show');
    decision.classList.add('hidden');
    currentIndex = null;
  });

})();

