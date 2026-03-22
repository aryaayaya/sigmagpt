var currentUser = '';
var isTyping = false;
var currentConvId = null;
var conversations = {};

var BOT_REPLY = "Great point. Let me elaborate: this is actually a well-studied problem in computer science. The optimal solution typically involves a combination of strategies that balance time complexity with space complexity.";

function login() {
  var user = document.getElementById('username').value.trim();
  var pass = document.getElementById('password').value.trim();
  if (!user || !pass) return;
  currentUser = user;
  document.getElementById('displayName').textContent = user;
  document.getElementById('avatarInitial').textContent = user[0].toUpperCase();
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

function logout() {
  currentUser = '';
  conversations = {};
  currentConvId = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('history').innerHTML = '';
  resetChat();
}

function generateId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function sendMessage() {
  if (isTyping) return;
  var input = document.getElementById('userInput');
  var text = input.value.trim();
  if (!text) return;

  removeEmptyState();

  if (!currentConvId) {
    currentConvId = generateId();
    var title = text.length > 30 ? text.slice(0, 30) + '…' : text;
    conversations[currentConvId] = { title: title, messages: [] };
    addHistoryItem(currentConvId, title);
  }

  conversations[currentConvId].messages.push({ text: text, sender: 'user' });
  addMessage(text, 'user');
  input.value = '';

  isTyping = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  setTimeout(function () {
    removeTyping();
    conversations[currentConvId].messages.push({ text: BOT_REPLY, sender: 'bot' });
    addMessage(BOT_REPLY, 'bot');
    isTyping = false;
    document.getElementById('sendBtn').disabled = false;
  }, 1000);
}

function addMessage(text, sender) {
  var chatBox = document.getElementById('chatBox');
  var wrap = document.createElement('div');
  wrap.className = 'message ' + sender;

  var av = document.createElement('div');
  av.className = 'msg-avatar';
  av.textContent = sender === 'user' ? currentUser[0].toUpperCase() : 'S';

  var bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  wrap.appendChild(av);
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  var chatBox = document.getElementById('chatBox');
  var wrap = document.createElement('div');
  wrap.className = 'message bot';
  wrap.id = 'typingMsg';

  var av = document.createElement('div');
  av.className = 'msg-avatar';
  av.textContent = 'S';

  var bubble = document.createElement('div');
  bubble.className = 'bubble typing-indicator';
  bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  wrap.appendChild(av);
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  var el = document.getElementById('typingMsg');
  if (el) el.remove();
}

function removeEmptyState() {
  var el = document.getElementById('emptyState');
  if (el) el.remove();
}

function newChat() {
  currentConvId = null;
  resetChat();
  setActiveHistoryItem(null);
}

function resetChat() {
  document.getElementById('chatBox').innerHTML =
    '<div class="empty-state" id="emptyState">' +
    '<div class="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>' +
    '<h3>How can I help you?</h3></div>';
}

function loadConversation(convId) {
  if (!conversations[convId]) return;

  currentConvId = convId;
  var conv = conversations[convId];

  document.getElementById('chatBox').innerHTML = '';

  conv.messages.forEach(function (msg) {
    addMessage(msg.text, msg.sender);
  });

  setActiveHistoryItem(convId);
}

function setActiveHistoryItem(convId) {
  document.querySelectorAll('.history-item').forEach(function (el) {
    el.classList.remove('active');
    if (convId && el.dataset.convId === convId) {
      el.classList.add('active');
    }
  });
}

function addHistoryItem(convId, title) {
  var hist = document.getElementById('history');
  setActiveHistoryItem(null);

  var item = document.createElement('div');
  item.className = 'history-item active';
  item.dataset.convId = convId;
  item.title = title;

//   // Icon + text layout
  item.innerHTML =
    '<svg class="hist-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
    '<span class="hist-title">' + title + '</span>';

  item.addEventListener('click', function () {
    loadConversation(convId);
  });

  hist.prepend(item);
}

document.getElementById('password').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') login();
});

document.getElementById('userInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') sendMessage();
});