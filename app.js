// app.js - المنطق الرئيسي للتطبيق

// حالة التطبيق
let currentUser = null;
let quotes = [];
let users = [];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkAuth();
    loadData();
});

// تهيئة التطبيق
function initApp() {
    // تسجيل Service Worker للتطبيق التقدمي
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker مسجل بنجاح'))
            .catch(err => console.log('خطأ في تسجيل Service Worker:', err));
    }
    
    // طلب الإذن للإشعارات
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// تحقق من تسجيل الدخول
function checkAuth() {
    const userData = localStorage.getItem('user');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForLoggedInUser();
    } else {
        // إذا لم يكن مسجلاً، توجيه لصفحة التسجيل
        if (!window.location.pathname.includes('index.html') && 
            !window.location.pathname.includes('login.html') &&
            !window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        }
    }
}

// تحديث الواجهة للمستخدم المسجل
function updateUIForLoggedInUser() {
    // تحديث اسم المستخدم في القوائم
    const userElements = document.querySelectorAll('.username-display');
    userElements.forEach(el => {
        if (currentUser.username) {
            el.textContent = currentUser.username;
        }
    });
}

// تحميل البيانات
async function loadData() {
    try {
        // تحميل قاعدة البيانات المحلية
        quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // إذا كانت البيانات فارغة، تهيئة ببيانات تجريبية
        if (quotes.length === 0) {
            initializeSampleData();
        }
        
        updateStats();
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

// تهيئة بيانات تجريبية
function initializeSampleData() {
    const sampleQuotes = [
        {
            id: 1,
            text: "أعظم المجد ليس في عدم السقوط، بل في النهوض كلما سقطنا",
            author: "كونفوشيوس",
            userId: "user1",
            likes: 156,
            comments: 23,
            shares: 45,
            category: "حكم",
            tags: ["حكمة", "نجاح"],
            date: "قبل يومين",
            image: null
        },
        {
            id: 2,
            text: "الحياة ليست انتظار العاصفة لتمر، بل هي تعلم الرقص تحت المطر",
            author: "فيفيان جرين",
            userId: "user2",
            likes: 289,
            comments: 42,
            shares: 78,
            category: "حياة",
            tags: ["تفاؤل", "حياة"],
            date: "قبل أسبوع",
            image: null
        },
        {
            id: 3,
            text: "لا تيأس من الحياة، فما زال فيها من يساوي ابتسامتك دمعة",
            author: "مجهول",
            userId: "user3",
            likes: 432,
            comments: 65,
            shares: 123,
            category: "أمل",
            tags: ["أمل", "تشجيع"],
            date: "قبل 3 أيام",
            image: null
        }
    ];
    
    const sampleUsers = [
        {
            id: "user1",
            username: "أحمد_الحكيم",
            fullName: "أحمد محمد",
            email: "ahmed@example.com",
            bio: "محب للحكمة والأدب",
            followers: 1245,
            following: 543,
            posts: 67,
            joinDate: "2023-01-15"
        },
        {
            id: "user2",
            username: "سارة_الأديبة",
            fullName: "سارة علي",
            email: "sara@example.com",
            bio: "كاتبة وشاعرة",
            followers: 2890,
            following: 876,
            posts: 123,
            joinDate: "2022-11-20"
        }
    ];
    
    localStorage.setItem('quotes', JSON.stringify(sampleQuotes));
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    quotes = sampleQuotes;
    users = sampleUsers;
}

// تحديث الإحصائيات
function updateStats() {
    const totalQuotes = quotes.length;
    const totalLikes = quotes.reduce((sum, quote) => sum + quote.likes, 0);
    const totalUsers = users.length;
    
    // تحديث العداد على الصفحة الرئيسية
    if (document.getElementById('totalQuotes')) {
        document.getElementById('totalQuotes').textContent = totalQuotes.toLocaleString();
        document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
        document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
    }
}

// تسجيل مستخدم جديد
function registerUser(userData) {
    const user = {
        id: 'user_' + Date.now(),
        ...userData,
        followers: 0,
        following: 0,
        posts: 0,
        totalLikes: 0,
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(user));
    currentUser = user;
    
    return user;
}

// تسجيل الدخول
function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        currentUser = user;
        return true;
    }
    return false;
}

// تسجيل الخروج
function logoutUser() {
    localStorage.removeItem('user');
    currentUser = null;
    window.location.href = 'index.html';
}

// نشر اقتباس جديد
function postQuote(quoteData) {
    const quote = {
        id: Date.now(),
        ...quoteData,
        userId: currentUser.id,
        likes: 0,
        comments: 0,
        shares: 0,
        date: new Date().toLocaleDateString('ar-EG'),
        time: 'الآن'
    };
    
    quotes.unshift(quote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // تحديث إحصائيات المستخدم
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex].posts = (users[userIndex].posts || 0) + 1;
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = users[userIndex];
        localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    return quote;
}

// الإعجاب بالاقتباس
function likeQuote(quoteId) {
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    if (quoteIndex > -1) {
        quotes[quoteIndex].likes += 1;
        localStorage.setItem('quotes', JSON.stringify(quotes));
        return true;
    }
    return false;
}

// الحصول على اقتباسات المستخدم
function getUserQuotes(userId) {
    return quotes.filter(quote => quote.userId === userId);
}

// البحث في الاقتباسات
function searchQuotes(query) {
    const searchTerm = query.toLowerCase();
    return quotes.filter(quote => 
        quote.text.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm) ||
        (quote.tags && quote.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
}

// تصفية الاقتباسات حسب الفئة
function filterQuotesByCategory(category) {
    if (!category) return quotes;
    return quotes.filter(quote => quote.category === category);
}

// الحصول على الاقتباسات الأكثر شيوعاً
function getPopularQuotes() {
    return [...quotes].sort((a, b) => b.likes - a.likes).slice(0, 20);
}

// الحصول على أحدث الاقتباسات
function getRecentQuotes() {
    return [...quotes].sort((a, b) => b.id - a.id).slice(0, 20);
}

// متابعة مستخدم
function followUser(userId) {
    if (!currentUser) return false;
    
    // تحديث قاعدة البيانات
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex].following = (users[userIndex].following || 0) + 1;
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = users[userIndex];
        localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    // تحديث المستخدم المتابَع
    const followedUserIndex = users.findIndex(u => u.id === userId);
    if (followedUserIndex > -1) {
        users[followedUserIndex].followers = (users[followedUserIndex].followers || 0) + 1;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    return true;
}

// حفظ اقتباس
function saveQuote(quoteId) {
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    if (!savedQuotes.includes(quoteId)) {
        savedQuotes.push(quoteId);
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
        return true;
    }
    return false;
}

// تصدير البيانات (للاستخدام المتقدم)
function exportData() {
    const data = {
        users: users,
        quotes: quotes,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-app-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// استيراد البيانات
function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        if (data.users && data.quotes) {
            localStorage.setItem('users', JSON.stringify(data.users));
            localStorage.setItem('quotes', JSON.stringify(data.quotes));
            users = data.users;
            quotes = data.quotes;
            updateStats();
            return true;
        }
    } catch (error) {
        console.error('خطأ في استيراد البيانات:', error);
    }
    return false;
      }
