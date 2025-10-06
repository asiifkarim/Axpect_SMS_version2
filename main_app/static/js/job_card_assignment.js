/**
 * Enhanced Job Card Assignment System
 * Provides real-time assignment, notifications, and status updates
 */

class JobCardAssignmentManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initRealTimeUpdates();
    }

    bindEvents() {
        // Quick assignment buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-assign-btn')) {
                this.handleQuickAssignment(e.target);
            }
            
            if (e.target.classList.contains('bulk-assign-btn')) {
                this.handleBulkAssignment();
            }
            
            if (e.target.classList.contains('reassign-btn')) {
                this.handleReassignment(e.target);
            }
        });

        // Assignment form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('job-assignment-form')) {
                this.handleAssignmentFormSubmit(e);
            }
        });

        // Status update handlers
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('job-status-select')) {
                this.handleStatusUpdate(e.target);
            }
        });
    }

    handleQuickAssignment(button) {
        const jobCardId = button.dataset.jobcardId;
        const employeeId = button.dataset.employeeId;
        const employeeName = button.dataset.employeeName;

        // Show confirmation with employee details
        this.showAssignmentConfirmation(jobCardId, employeeId, employeeName);
    }

    showAssignmentConfirmation(jobCardId, employeeId, employeeName) {
        const modal = this.createAssignmentModal(jobCardId, employeeId, employeeName);
        document.body.appendChild(modal);
        
        // Show modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Clean up when modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    createAssignmentModal(jobCardId, employeeId, employeeName) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-tasks me-2"></i>Assign Job Card
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="assignment-details">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6><i class="fas fa-clipboard-list text-primary"></i> Job Card Details</h6>
                                    <div id="job-card-details-${jobCardId}">
                                        <div class="spinner-border spinner-border-sm" role="status"></div>
                                        Loading job card details...
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="fas fa-user text-success"></i> Assignee</h6>
                                    <div class="employee-info">
                                        <strong>${employeeName}</strong>
                                        <div id="employee-details-${employeeId}">
                                            <div class="spinner-border spinner-border-sm" role="status"></div>
                                            Loading employee details...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="assignment-options mt-3">
                            <h6><i class="fas fa-cog text-info"></i> Assignment Options</h6>
                            <div class="form-group">
                                <label>Priority Level</label>
                                <select class="form-control" id="assignment-priority">
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM" selected>Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Due Date</label>
                                <input type="datetime-local" class="form-control" id="assignment-due-date">
                            </div>
                            <div class="form-group">
                                <label>Assignment Notes</label>
                                <textarea class="form-control" id="assignment-notes" rows="3" 
                                    placeholder="Add any specific instructions or notes for this assignment..."></textarea>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="notify-employee" checked>
                                <label class="form-check-label" for="notify-employee">
                                    Send notification to employee
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="jobCardAssignmentManager.confirmAssignment('${jobCardId}', '${employeeId}')">
                            <i class="fas fa-check"></i> Confirm Assignment
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Load job card and employee details
        this.loadJobCardDetails(jobCardId);
        this.loadEmployeeDetails(employeeId);

        return modal;
    }

    loadJobCardDetails(jobCardId) {
        fetch(`/api/jobcard/${jobCardId}/details/`)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById(`job-card-details-${jobCardId}`);
                if (container) {
                    container.innerHTML = `
                        <div class="job-card-summary">
                            <p><strong>Type:</strong> ${data.type}</p>
                            <p><strong>Description:</strong> ${data.description}</p>
                            <p><strong>Customer:</strong> ${data.customer_name || 'N/A'}</p>
                            <p><strong>Current Status:</strong> 
                                <span class="badge badge-${this.getStatusColor(data.status)}">${data.status}</span>
                            </p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading job card details:', error);
                const container = document.getElementById(`job-card-details-${jobCardId}`);
                if (container) {
                    container.innerHTML = '<p class="text-danger">Error loading job card details</p>';
                }
            });
    }

    loadEmployeeDetails(employeeId) {
        fetch(`/api/employee/${employeeId}/details/`)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById(`employee-details-${employeeId}`);
                if (container) {
                    container.innerHTML = `
                        <div class="employee-summary">
                            <p><small><strong>Department:</strong> ${data.department || 'N/A'}</small></p>
                            <p><small><strong>Current Workload:</strong> ${data.active_jobs || 0} active jobs</small></p>
                            <p><small><strong>Availability:</strong> 
                                <span class="badge badge-${data.is_available ? 'success' : 'warning'}">
                                    ${data.is_available ? 'Available' : 'Busy'}
                                </span>
                            </small></p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading employee details:', error);
                const container = document.getElementById(`employee-details-${employeeId}`);
                if (container) {
                    container.innerHTML = '<p class="text-danger"><small>Error loading employee details</small></p>';
                }
            });
    }

    confirmAssignment(jobCardId, employeeId) {
        const priority = document.getElementById('assignment-priority').value;
        const dueDate = document.getElementById('assignment-due-date').value;
        const notes = document.getElementById('assignment-notes').value;
        const notifyEmployee = document.getElementById('notify-employee').checked;

        const assignmentData = {
            job_card_id: jobCardId,
            employee_id: employeeId,
            priority: priority,
            due_date: dueDate,
            notes: notes,
            notify_employee: notifyEmployee
        };

        // Show loading state
        const confirmBtn = event.target;
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...';
        confirmBtn.disabled = true;

        // Submit assignment
        fetch('/api/jobcard/assign/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(),
            },
            body: JSON.stringify(assignmentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success notification
                notificationManager.showJobAssignment(data.job_card, data.assigned_to_name);
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(confirmBtn.closest('.modal'));
                modal.hide();
                
                // Refresh the page or update the UI
                this.refreshJobCardList();
                
                // Send real-time notification to employee if enabled
                if (notifyEmployee) {
                    this.sendEmployeeNotification(employeeId, data.job_card);
                }
            } else {
                notificationManager.error(data.error || 'Failed to assign job card');
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Assignment error:', error);
            notificationManager.error('An error occurred while assigning the job card');
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
        });
    }

    handleBulkAssignment() {
        const selectedJobCards = document.querySelectorAll('.job-card-checkbox:checked');
        
        if (selectedJobCards.length === 0) {
            notificationManager.warning('Please select at least one job card to assign');
            return;
        }

        // Show bulk assignment modal
        this.showBulkAssignmentModal(Array.from(selectedJobCards).map(cb => cb.value));
    }

    showBulkAssignmentModal(jobCardIds) {
        // Implementation for bulk assignment modal
        notificationManager.info(`Bulk assignment for ${jobCardIds.length} job cards - Feature coming soon!`);
    }

    handleReassignment(button) {
        const jobCardId = button.dataset.jobcardId;
        const currentAssignee = button.dataset.currentAssignee;
        
        // Show reassignment modal
        this.showReassignmentModal(jobCardId, currentAssignee);
    }

    showReassignmentModal(jobCardId, currentAssignee) {
        notificationManager.info('Reassignment feature - Implementation in progress');
    }

    handleStatusUpdate(select) {
        const jobCardId = select.dataset.jobcardId;
        const newStatus = select.value;
        const oldStatus = select.dataset.oldStatus;

        if (newStatus === oldStatus) return;

        // Update status via API
        fetch(`/api/jobcard/${jobCardId}/status/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(),
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                notificationManager.success(`Job card status updated to: ${newStatus}`);
                select.dataset.oldStatus = newStatus;
                
                // Update UI elements
                this.updateJobCardStatusUI(jobCardId, newStatus);
            } else {
                notificationManager.error(data.error || 'Failed to update status');
                select.value = oldStatus; // Revert selection
            }
        })
        .catch(error => {
            console.error('Status update error:', error);
            notificationManager.error('An error occurred while updating status');
            select.value = oldStatus; // Revert selection
        });
    }

    updateJobCardStatusUI(jobCardId, newStatus) {
        // Update status badges and other UI elements
        const statusBadges = document.querySelectorAll(`[data-jobcard-id="${jobCardId}"] .status-badge`);
        statusBadges.forEach(badge => {
            badge.className = `badge status-badge badge-${this.getStatusColor(newStatus)}`;
            badge.textContent = newStatus;
        });
    }

    sendEmployeeNotification(employeeId, jobCard) {
        fetch('/api/notifications/send/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(),
            },
            body: JSON.stringify({
                recipient_id: employeeId,
                type: 'job_assignment',
                message: `You have been assigned a new job card: #${jobCard.number}`,
                job_card_id: jobCard.id
            })
        })
        .catch(error => {
            console.error('Error sending notification:', error);
        });
    }

    refreshJobCardList() {
        // Refresh the current page or specific sections
        if (typeof DataTable !== 'undefined' && $.fn.DataTable.isDataTable('#job-cards-table')) {
            $('#job-cards-table').DataTable().ajax.reload();
        } else {
            // Fallback: reload the page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    initRealTimeUpdates() {
        // Listen for real-time job card updates
        if (window.notificationManager) {
            // This would integrate with WebSocket or polling for real-time updates
            setInterval(() => {
                this.checkJobCardUpdates();
            }, 60000); // Check every minute
        }
    }

    checkJobCardUpdates() {
        // Check for job card updates and refresh UI if needed
        fetch('/api/jobcard/updates/', {
            headers: {
                'X-CSRFToken': this.getCSRFToken(),
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.updates && data.updates.length > 0) {
                data.updates.forEach(update => {
                    this.handleJobCardUpdate(update);
                });
            }
        })
        .catch(error => {
            console.error('Error checking job card updates:', error);
        });
    }

    handleJobCardUpdate(update) {
        switch (update.type) {
            case 'status_change':
                this.updateJobCardStatusUI(update.job_card_id, update.new_status);
                break;
            case 'assignment_change':
                notificationManager.info(`Job Card #${update.job_card_number} has been reassigned`);
                break;
            case 'new_comment':
                notificationManager.info(`New comment on Job Card #${update.job_card_number}`);
                break;
        }
    }

    getStatusColor(status) {
        const colors = {
            'PENDING': 'warning',
            'IN_PROGRESS': 'info',
            'COMPLETED': 'success',
            'ON_HOLD': 'secondary',
            'CANCELLED': 'danger'
        };
        return colors[status] || 'primary';
    }

    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.jobCardAssignmentManager = new JobCardAssignmentManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobCardAssignmentManager;
}
