Enter// db.js - إدارة قاعدة البيانات المحلية

class LocalDatabase {
    constructor() {
        this.dbName = 'quotesAppDB';
        this.initDB();
    }
    
    initDB() {
        // تهيئة قواعد البيانات إذا لم تكن موجودة
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('quotes')) {
            localStorage.setItem('quotes', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('savedQuotes')) {
            localStorage.setItem('savedQuotes', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('notifications')) {
            localStorage.setItem('notifications', JSON.stringify([]));
        }
    }
    
    // المستخدمون
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }
    
    getUserById(userId) {
        const users = this.getUsers();
        return users.find(user => user.id === userId);
    }
    
    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    }
    
    saveUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index > -1) {
            users[index] = user;
        } else {
            users.push(user);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }
    
    deleteUser(userId) {
        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        return true;
    }
    
    // الاقتباسات
    getQuotes() {
        return JSON.parse(localStorage.getItem('quotes') || '[]');
    }
    
    getQuoteById(quoteId) {
        const quotes = this.getQuotes();
        return quotes.find(quote => quote.id === quoteId);
    }
    
    getQuotesByUser(userId) {
        const quotes = this.getQuotes();
        return quotes.filter(quote => quote.userId === userId);
    }
    
    saveQuote(quote) {
        const quotes = this.getQuotes();
        const index = quotes.findIndex(q => q.id === quote.id);
        
        if (index > -1) {
            quotes[index] = quote;
        } else {
            quotes.push(quote);
        }
        
        localStorage.setItem('quotes', JSON.stringify(quotes));
        return quote;
    }
    
    deleteQuote(quoteId) {
        const quotes = this.getQuotes();
        const filteredQuotes = quotes.filter(quote => quote.id !== quoteId);
        localStorage.setItem('quotes', JSON.stringify(filteredQuotes));
        return true;
    }
    
    likeQuote(quoteId) {
        const quote = this.getQuoteById(quoteId);
        if (quote) {
            quote.likes = (quote.likes || 0) + 1;
            this.saveQuote(quote);
            return quote.likes;
        }
        return null;
    }
    
    // الاقتباسات المحفوظة
    getSavedQuotes() {
        const savedIds = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        const quotes = this.getQuotes();
        return quotes.filter(quote => savedIds.includes(quote.id));
    }
    
    saveQuoteToFavorites(quoteId) {
        const saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        if (!saved.includes(quoteId)) {
            saved.push(quoteId);
            localStorage.setItem('savedQuotes', JSON.stringify(saved));
            return true;
        }
        return false;
    }
    
    removeQuoteFromFavorites(quoteId) {
        const saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        const filtered = saved.filter(id => id !== quoteId);
        localStorage.setItem('savedQuotes', JSON.stringify(filtered));
        return true;
    }
    
    // الإشعارات
    getNotifications() {
        return JSON.parse(localStorage.getItem('notifications') || '[]');
    }
    
    addNotification(notification) {
        const notifications = this.getNotifications();
        notifications.unshift({
            id: Date.now(),
            ...notification,
            read: false,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('notifications', JSON.stringify(notations));
        return notification;
    }
    
    markNotificationAsRead(notificationId) {
        const notifications = this.getNotifications();
        const index = notifications.findIndex(n => n.id === notificationId);
        
        if (index > -1) {
            notifications[index].read = true;
            localStorage.setItem('notifications', JSON.stringify(notifications));
            return true;
        }
        return false;
    }
    
    // الإحصائيات
    getStats() {
        const quotes = this.getQuotes();
        const users = this.getUsers();
        
        return {
            totalQuotes: quotes.length,
            totalUsers: users.length,
            totalLikes: quotes.reduce((sum, quote) => sum + (quote.likes || 0), 0),
            totalComments: quotes.reduce((sum, quote) => sum + (quote.comments || 0), 0),
            mostActiveUser: this.getMostActiveUser(),
            mostLikedQuote: this.getMostLikedQuote()
        };
    }
    
    getMostActiveUser() {
        const users = this.getUsers();
        return users.sort((a, b) => (b.posts || 0) - (a.posts || 0))[0];
    }
    
    getMostLikedQuote() {
        const quotes = this.getQuotes();
        return quotes.sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
    }
    
    // النسخ الاحتياطي
    backup() {
        return {
            users: this.getUsers(),
            quotes: this.getQuotes(),
            savedQuotes: JSON.parse(localStorage.getItem('savedQuotes') || '[]'),
            notifications: this.getNotifications(),
            backupDate: new Date().toISOString()
        };
    }
    
    restore(backupData) {
        if (backupData.users) {
            localStorage.setItem('users', JSON.stringify(backupData.users));
        }
        
        if (backupData.quotes) {
            localStorage.setItem('quotes', JSON.stringify(backupData.quotes));
        }
        
        if (backupData.savedQuotes) {
            localStorage.setItem('savedQuotes', JSON.stringify(backupData.savedQuotes));
        }
        
        if (backupData.notifications) {
            localStorage.setItem('notifications', JSON.stringify(backupData.notifications));
        }
        
        return true;
    }
    
    // البحث المتقدم
    searchAdvanced(query, filters = {}) {
        let results = this.getQuotes();
        
        // البحث النصي
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(quote => 
                quote.text.toLowerCase().includes(searchTerm) ||
                quote.author.toLowerCase().includes(searchTerm) ||
                (quote.tags && quote.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        // التصفية بالفئة
        if (filters.category) {
            results = results.filter(quote => quote.category === filters.category);
        }
        
        // التصفية بالمستخدم
        if (filters.userId) {
            results = results.filter(quote => quote.userId === filters.userId);
        }
        
        // التصفية بالتاريخ
        if (filters.dateRange) {
            // يمكن إضافة منطق أكثر تعقيداً هنا
        }
        
        // الترتيب
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'likes':
                    results.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                    break;
                case 'recent':
                    results.sort((a, b) => b.id - a.id);
                    break;
                case 'comments':
                    results.sort((a, b) => (b.comments || 0) - (a.comments || 0));
                    break;
            }
        }
        
        return results;
    }
}

// إنشاء نسخة عامة من قاعدة البيانات
const db = new LocalDatabase();

// تصدير الوظائف للاستخدام في الملفات الأخرى
window.db = db;
