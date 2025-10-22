/**
 * Enhanced Notification System for Axpect SMS
 * Provides toast notifications, real-time updates, and popup alerts
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.audioContext = null;
        this.soundEnabled = true;
        this.init();
    }

    init() {
        // Create notification container
        this.createContainer();
        
        // Initialize audio context for notification sounds
        this.initAudioContext();
        
        // Initialize real-time notifications if available
        this.initRealTimeNotifications();
        
        // Check for pending notifications on page load
        this.checkPendingNotifications();
        
        // Initialize notification bell dropdown
        this.initNotificationBell();
    }

    createContainer() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        this.container.innerHTML = `
            <style>
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    max-width: 350px;
                }
                
                .toast-notification {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    margin-bottom: 10px;
                    padding: 12px;
                    border-left: 4px solid #007bff;
                    animation: slideInRight 0.3s ease-out;
                    position: relative;
                    overflow: hidden;
                    max-width: 350px;
                    min-width: 280px;
                    font-size: 14px;
                }
                
                .toast-notification.success {
                    border-left-color: #28a745;
                }
                
                .toast-notification.error {
                    border-left-color: #dc3545;
                }
                
                .toast-notification.warning {
                    border-left-color: #ffc107;
                }
                
                .toast-notification.info {
                    border-left-color: #17a2b8;
                }
                
                .toast-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .toast-title {
                    font-weight: 600;
                    color: #333;
                    display: flex;
                    align-items: center;
                }
                
                .toast-title i {
                    margin-right: 8px;
                    font-size: 16px;
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .toast-close:hover {
                    color: #666;
                }
                
                .toast-body {
                    color: #666;
                    line-height: 1.4;
                }
                
                .toast-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: rgba(0,0,0,0.1);
                    animation: progress 5s linear;
                }
                
                .toast-notification.success .toast-progress {
                    background: #28a745;
                }
                
                .toast-notification.error .toast-progress {
                    background: #dc3545;
                }
                
                .toast-notification.warning .toast-progress {
                    background: #ffc107;
                }
                
                .toast-notification.info .toast-progress {
                    background: #17a2b8;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                @keyframes progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
                
                /* Job Card Assignment Notification Styles */
                .job-assignment-notification {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-left: none;
                }
                
                .job-assignment-notification .toast-title,
                .job-assignment-notification .toast-body {
                    color: white;
                }
                
                .job-assignment-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .job-assignment-notification .toast-close:hover {
                    color: white;
                }
                
                /* Direct Message Notification Styles */
                .direct-message-notification {
                    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                    color: white;
                    border-left: none;
                }
                
                .direct-message-notification .toast-title,
                .direct-message-notification .toast-body {
                    color: white;
                }
                
                .direct-message-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .direct-message-notification .toast-close:hover {
                    color: white;
                }
                
                /* Chat Notification Styles */
                .chat-notification {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border-left: none;
                }
                
                .chat-notification .toast-title,
                .chat-notification .toast-body {
                    color: white;
                }
                
                .chat-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .chat-notification .toast-close:hover {
                    color: white;
                }
                
                /* Leave Application Notification Styles */
                .leave-notification {
                    background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
                    color: white;
                    border-left: none;
                }
                
                .leave-notification .toast-title,
                .leave-notification .toast-body {
                    color: white;
                }
                
                .leave-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .leave-notification .toast-close:hover {
                    color: white;
                }
                
                /* Task Assignment Notification Styles */
                .task-assignment-notification {
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    color: white;
                    border-left: none;
                }
                
                .task-assignment-notification .toast-title,
                .task-assignment-notification .toast-body {
                    color: white;
                }
                
                .task-assignment-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .task-assignment-notification .toast-close:hover {
                    color: white;
                }
                
                /* Task Update Notification Styles */
                .task-update-notification {
                    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                    color: white;
                    border-left: none;
                }
                
                .task-update-notification .toast-title,
                .task-update-notification .toast-body {
                    color: white;
                }
                
                .task-update-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .task-update-notification .toast-close:hover {
                    color: white;
                }
                
                /* Customer Notification Styles */
                .customer-notification {
                    background: linear-gradient(135deg, #28a745 0%, #218838 100%);
                    color: white;
                    border-left: none;
                }
                
                .customer-notification .toast-title,
                .customer-notification .toast-body {
                    color: white;
                }
                
                .customer-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .customer-notification .toast-close:hover {
                    color: white;
                }
                
                /* Message Notification Styles */
                .message-notification {
                    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                    color: white;
                    border-left: none;
                }
                
                .message-notification .toast-title,
                .message-notification .toast-body {
                    color: white;
                }
                
                .message-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .message-notification .toast-close:hover {
                    color: white;
                }
                
                /* Job Update Notification Styles */
                .job-update-notification {
                    background: linear-gradient(135deg, #6610f2 0%, #5a0fc9 100%);
                    color: white;
                    border-left: none;
                }
                
                .job-update-notification .toast-title,
                .job-update-notification .toast-body {
                    color: white;
                }
                
                .job-update-notification .toast-close {
                    color: rgba(255,255,255,0.8);
                }
                
                .job-update-notification .toast-close:hover {
                    color: white;
                }
            </style>
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', title = null, duration = 5000, options = {}) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            job_assignment: 'fas fa-tasks'
        };

        const titles = {
            success: title || 'Success',
            error: title || 'Error',
            warning: title || 'Warning',
            info: title || 'Information',
            job_assignment: title || 'Job Assignment'
        };

        // Play notification sound based on type
        const soundType = options.soundType || this.getSoundTypeFromNotificationType(type);
        this.playNotificationSound(soundType);

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type} ${options.className || ''}`;
        
        const toastId = 'toast_' + Date.now();
        toast.id = toastId;

        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">
                    <i class="${icons[type] || icons.info}"></i>
                    ${titles[type]}
                </div>
                <button class="toast-close" onclick="notificationManager.hide('${toastId}')">&times;</button>
            </div>
            <div class="toast-body">${message}</div>
            ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;

        this.container.appendChild(toast);
        this.notifications.push({ id: toastId, element: toast });

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toastId);
            }, duration);
        }

        // Add click handlers for actions if provided
        if (options.actions) {
            this.addActionButtons(toast, options.actions);
        }

        return toastId;
    }

    hide(toastId) {
        const notification = this.notifications.find(n => n.id === toastId);
        if (notification) {
            notification.element.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                this.notifications = this.notifications.filter(n => n.id !== toastId);
            }, 300);
        }
    }

    addActionButtons(toast, actions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'toast-actions';
        actionsDiv.style.cssText = 'margin-top: 10px; display: flex; gap: 8px;';

        actions.forEach(action => {
            const button = document.createElement('button');
            button.textContent = action.text;
            button.className = `btn btn-sm ${action.className || 'btn-primary'}`;
            button.onclick = action.handler;
            actionsDiv.appendChild(button);
        });

        toast.querySelector('.toast-body').appendChild(actionsDiv);
    }

    // Job Card Assignment specific notifications
    showJobAssignment(jobCard, assignedTo) {
        const message = `
            <strong>Job Card #${jobCard.number}</strong> has been assigned to <strong>${assignedTo}</strong>
            <br><small>Priority: ${jobCard.priority} | Due: ${jobCard.due_date || 'Not set'}</small>
        `;

        return this.show(message, 'job_assignment', 'New Job Assignment', 7000, {
            className: 'job-assignment-notification',
            actions: [
                {
                    text: 'View Details',
                    className: 'btn-light btn-sm',
                    handler: () => {
                        window.location.href = `/job-card/${jobCard.id}/`;
                    }
                }
            ]
        });
    }

    // Real-time notification methods
    initRealTimeNotifications() {
        // Check if WebSocket or Server-Sent Events are available
        if (typeof WebSocket !== 'undefined') {
            this.initWebSocketNotifications();
        } else {
            // Fallback to polling
            this.initPollingNotifications();
        }
    }

    initWebSocketNotifications() {
        // WebSocket implementation for real-time notifications
        // This would connect to Django Channels if available
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/social/notifications/`;
            
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeNotification(data);
            };
            
            this.websocket.onerror = () => {
                console.log('WebSocket connection failed, falling back to polling');
                this.initPollingNotifications();
            };
        } catch (error) {
            console.log('WebSocket not available, using polling');
            this.initPollingNotifications();
        }
    }

    initPollingNotifications() {
        // Poll for new notifications every 30 seconds
        setInterval(() => {
            this.checkPendingNotifications();
        }, 30000);
    }

    checkPendingNotifications() {
        // Check for pending notifications via AJAX
        fetch('/api/notifications/pending/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': this.getCSRFToken(),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.notifications) {
                data.notifications.forEach(notification => {
                    this.handleRealTimeNotification(notification);
                });
            }
        })
        .catch(error => {
            console.log('Error checking notifications:', error);
        });
    }

    handleRealTimeNotification(data) {
        // Check if already displayed in this session
        const displayedNotifications = JSON.parse(
            sessionStorage.getItem('displayed_notifications') || '[]'
        );
        
        if (data.id && displayedNotifications.includes(data.id)) {
            return; // Don't show again
        }
        
        // Display notification based on type
        let notificationShown = false;
        const redirectUrl = data.redirect_url || '#';
        
        switch (data.type) {
            case 'leave_application':
                this.show(data.message, data.level || 'warning', data.title || 'Leave Application', 7000, {
                    className: 'leave-notification',
                    actions: [{
                        text: 'View Request',
                        className: 'btn-light btn-sm',
                        handler: () => {
                            window.location.href = redirectUrl;
                        }
                    }]
                });
                notificationShown = true;
                break;
                
            case 'task_assignment':
                this.show(data.message, data.level || 'info', data.title || 'Task Assignment', 7000, {
                    className: 'task-assignment-notification',
                    actions: [{
                        text: 'View Task',
                        className: 'btn-light btn-sm',
                        handler: () => {
                            window.location.href = redirectUrl;
                        }
                    }]
                });
                notificationShown = true;
                break;
                
            case 'task_update':
                this.show(data.message, data.level || 'info', data.title || 'Task Update', 7000, {
                    className: 'task-update-notification',
                    actions: [{
                        text: 'View Task',
                        className: 'btn-light btn-sm',
                        handler: () => {
                            window.location.href = redirectUrl;
                        }
                    }]
                });
                notificationShown = true;
                break;
                
            case 'customer_addition':
                this.show(data.message, data.level || 'success', data.title || 'New Customer', 7000, {
                    className: 'customer-notification',
                    actions: [{
                        text: 'View Customer',
                        className: 'btn-light btn-sm',
                        handler: () => {
                            window.location.href = redirectUrl;
                        }
                    }]
                });
                notificationShown = true;
                break;
                
            case 'message':
                this.show(data.message, data.level || 'info', data.title || 'New Message', 7000, {
                    className: 'message-notification',
                    actions: [{
                        text: 'View Message',
                        className: 'btn-light btn-sm',
                        handler: () => {
                            window.location.href = redirectUrl;
                        }
                    }]
                });
                notificationShown = true;
                break;
                
            case 'job_assignment':
                if (data.job_card) {
                    this.showJobAssignment(data.job_card, data.assigned_to);
                } else {
                    this.show(data.message, data.level || 'success', data.title || 'Job Assignment', 7000, {
                        className: 'job-assignment-notification',
                        actions: [{
                            text: 'View Job',
                            className: 'btn-light btn-sm',
                            handler: () => {
                                window.location.href = redirectUrl;
                            }
                        }]
                    });
                }
                notificationShown = true;
                break;
                
            case 'job_status_update':
                this.show(
                    data.message || `Job Card #${data.job_card?.number} status updated to: ${data.new_status}`,
                    data.level || 'info',
                    data.title || 'Job Status Update',
                    7000,
                    {
                        className: 'job-update-notification',
                        actions: [{
                            text: 'View Job',
                            className: 'btn-light btn-sm',
                            handler: () => {
                                window.location.href = redirectUrl;
                            }
                        }]
                    }
                );
                notificationShown = true;
                break;
                
            case 'new_message':
                this.show(data.message, data.level || 'info', data.title || 'New Message', 7000, {
                    className: 'message-notification',
                    actions: [{
                        text: 'View Message',
                        className: 'btn-light btn-sm',
                        handler: () => {
                            window.location.href = redirectUrl;
                        }
                    }]
                });
                notificationShown = true;
                break;
                
            case 'direct_message':
                this.show(data.notification?.message || data.message, 'info', data.notification?.title || data.title || 'Direct Message', 7000, {
                    className: 'direct-message-notification',
                    actions: [{
                        text: 'View Message',
                        className: 'btn-light btn-sm',
                        handler: () => {
                            const chatUrl = redirectUrl !== '#' ? redirectUrl : `/social/chat/${data.notification?.group_id || data.group_id}/`;
                            window.location.href = chatUrl;
                        }
                    }]
                });
                notificationShown = true;
                break;
                
            default:
                // For any other notification type, show with a generic action button if redirect_url exists
                if (redirectUrl && redirectUrl !== '#') {
                    this.show(data.message, data.level || 'info', data.title || 'Notification', 7000, {
                        actions: [{
                            text: 'View Details',
                            className: 'btn-light btn-sm',
                            handler: () => {
                                window.location.href = redirectUrl;
                            }
                        }]
                    });
                } else {
                    this.show(data.message, data.level || 'info', data.title || 'Notification');
                }
                notificationShown = true;
        }
        
        // If notification was shown and has an ID, track it
        if (notificationShown && data.id) {
            // Mark as displayed in session
            displayedNotifications.push(data.id);
            sessionStorage.setItem('displayed_notifications', 
                JSON.stringify(displayedNotifications)
            );
            
            // Mark as read on server
            this.markNotificationAsRead(data.id);
        }
    }

    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    markNotificationAsRead(notificationId) {
        // Mark notification as read on server
        fetch('/api/notifications/mark-read/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(),
            },
            body: JSON.stringify({
                notification_id: notificationId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Notification marked as read:', notificationId);
            } else {
                console.warn('Failed to mark notification as read:', data.error);
            }
        })
        .catch(error => {
            console.error('Error marking notification as read:', error);
        });
    }

    clearDisplayedNotifications() {
        // Clear the session storage of displayed notifications
        sessionStorage.removeItem('displayed_notifications');
        console.log('Cleared displayed notifications from session');
    }

    // Utility methods for common notifications
    success(message, title = null) {
        return this.show(message, 'success', title);
    }

    error(message, title = null) {
        return this.show(message, 'error', title);
    }

    warning(message, title = null) {
        return this.show(message, 'warning', title);
    }

    info(message, title = null) {
        return this.show(message, 'info', title);
    }

    // Clear all notifications
    clearAll() {
        this.notifications.forEach(notification => {
            this.hide(notification.id);
        });
    }

    // Initialize notification bell dropdown
    initNotificationBell() {
        const bell = document.getElementById('notification-bell');
        const dropdown = document.getElementById('notification-dropdown');
        const viewAllLink = document.getElementById('view-all-notifications');
        
        if (!bell || !dropdown) return;
        
        // Set up view all notifications link based on user type
        if (viewAllLink) {
            const userType = document.body.dataset.userType || '3'; // Default to employee
            let notificationUrl = '#';
            
            if (userType === '1') {
                notificationUrl = '/admin/notifications/'; // Admin notifications
            } else if (userType === '2') {
                notificationUrl = '/manager/view/notification/';
            } else {
                notificationUrl = '/employee/view/notification/';
            }
            
            viewAllLink.href = notificationUrl;
        }
        
        // Load notifications when bell is clicked
        bell.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadNotificationDropdown();
        });
        
        // Initial load
        this.loadNotificationDropdown();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadNotificationDropdown();
        }, 30000);
    }

    // Load notifications for the dropdown
    loadNotificationDropdown() {
        fetch('/api/notifications/pending/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': this.getCSRFToken(),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.updateNotificationBell(data.notifications);
            }
        })
        .catch(error => {
            console.log('Error loading notifications:', error);
        });
    }

    // Update notification bell and dropdown
    updateNotificationBell(notifications) {
        const count = notifications.length;
        const countBadge = document.getElementById('notification-count');
        const header = document.getElementById('notification-header');
        const list = document.getElementById('notification-list');
        
        // Update count badge
        if (countBadge) {
            if (count > 0) {
                countBadge.textContent = count > 99 ? '99+' : count;
                countBadge.style.display = 'inline-block';
            } else {
                countBadge.style.display = 'none';
            }
        }
        
        // Update header
        if (header) {
            header.textContent = count === 1 ? '1 Notification' : `${count} Notifications`;
        }
        
        // Update notification list
        if (list) {
            if (count === 0) {
                list.innerHTML = `
                    <a href="#" class="dropdown-item text-center text-muted">
                        <i class="fas fa-bell-slash mr-2"></i>No new notifications
                    </a>
                `;
            } else {
                list.innerHTML = notifications.slice(0, 5).map(notification => {
                    const icon = this.getNotificationIcon(notification.type);
                    const timeAgo = this.timeAgo(new Date(notification.created_at));
                    
                    return `
                        <a href="#" class="dropdown-item notification-item" data-notification-id="${notification.id}">
                            <i class="${icon} mr-2"></i>
                            <span class="notification-text">${notification.message}</span>
                            <span class="float-right text-muted text-sm">${timeAgo}</span>
                        </a>
                    `;
                }).join('<div class="dropdown-divider"></div>');
            }
        }
        
        // Add click handlers for notification items
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const notificationId = item.dataset.notificationId;
                this.handleNotificationClick(notificationId);
            });
        });
    }

    // Get icon for notification type
    getNotificationIcon(type) {
        const icons = {
            'job_assignment': 'fas fa-tasks text-primary',
            'status_update': 'fas fa-info-circle text-info',
            'general': 'fas fa-bell text-warning',
            'success': 'fas fa-check-circle text-success',
            'error': 'fas fa-exclamation-circle text-danger',
            'warning': 'fas fa-exclamation-triangle text-warning'
        };
        return icons[type] || 'fas fa-bell text-info';
    }

    // Handle notification click
    handleNotificationClick(notificationId) {
        // Mark as read and handle navigation
        console.log('Notification clicked:', notificationId);
        
        // You can add logic here to:
        // 1. Mark notification as read
        // 2. Navigate to relevant page
        // 3. Show detailed notification
    }

    // Time ago helper function
    timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    initAudioContext() {
        try {
            // Initialize Web Audio API for notification sounds
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Check user's sound preference from localStorage or settings
            const soundPreference = localStorage.getItem('notification_sound_enabled');
            if (soundPreference !== null) {
                this.soundEnabled = soundPreference === 'true';
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.soundEnabled = false;
        }
    }

    playNotificationSound(type = 'default') {
        if (!this.soundEnabled || !this.audioContext) {
            return;
        }

        try {
            // Resume audio context if suspended (required for user interaction)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Create oscillator for notification beep
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Configure sound based on notification type
            let frequency, duration;
            switch (type) {
                case 'message':
                    frequency = 800; // Higher pitch for messages
                    duration = 0.2;
                    break;
                case 'task':
                    frequency = 600; // Medium pitch for tasks
                    duration = 0.3;
                    break;
                case 'urgent':
                    frequency = 1000; // High pitch for urgent notifications
                    duration = 0.4;
                    break;
                case 'leave':
                case 'feedback':
                case 'jobcard':
                    frequency = 500; // Lower pitch for admin notifications
                    duration = 0.25;
                    break;
                default:
                    frequency = 700; // Default pitch
                    duration = 0.2;
            }

            // Configure oscillator
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(frequency * 1.2, this.audioContext.currentTime + duration * 0.5);

            // Configure gain (volume)
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Play sound
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);

        } catch (error) {
            console.warn('Error playing notification sound:', error);
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('notification_sound_enabled', enabled.toString());
    }

    toggleSound() {
        this.setSoundEnabled(!this.soundEnabled);
        return this.soundEnabled;
    }

    getSoundTypeFromNotificationType(type) {
        // Map notification types to sound types
        const soundTypeMap = {
            'job_assignment': 'task',
            'new_message': 'message',
            'leave_request': 'leave',
            'feedback_submitted': 'feedback',
            'job_card_created': 'jobcard',
            'urgent': 'urgent',
            'error': 'urgent',
            'warning': 'urgent',
            'success': 'default',
            'info': 'default'
        };
        
        return soundTypeMap[type] || 'default';
    }
}

// Initialize notification manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.notificationManager = new NotificationManager();
    
    // Show any Django messages as notifications
    const djangoMessages = document.querySelectorAll('.django-messages .alert');
    djangoMessages.forEach(alert => {
        const type = alert.classList.contains('alert-success') ? 'success' :
                    alert.classList.contains('alert-danger') ? 'error' :
                    alert.classList.contains('alert-warning') ? 'warning' : 'info';
        
        const messageType = alert.getAttribute('data-message-type');
        const redirectUrl = alert.getAttribute('data-redirect-url');
        
        // Create options for clickable notifications
        let options = {};
        if (messageType === 'chat' && redirectUrl) {
            options = {
                className: 'chat-notification',
                actions: [{
                    text: 'View Message',
                    className: 'btn-light btn-sm',
                    handler: () => {
                        window.location.href = redirectUrl;
                    }
                }]
            };
        }
        
        notificationManager.show(alert.textContent.trim(), type, null, 7000, options);
        alert.style.display = 'none'; // Hide the original Django message
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
