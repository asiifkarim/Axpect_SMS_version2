import json
import requests
from datetime import datetime
from django.contrib import messages
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse, JsonResponse
from django.shortcuts import (HttpResponse, HttpResponseRedirect,
                              get_object_or_404, redirect, render)
from django.templatetags.static import static
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import UpdateView
import csv
from django.utils import timezone

from .forms import *
from .models import *
from .utils import get_attendance_stats, format_user_display_name


def admin_home(request):
    total_manager = Manager.objects.all().count()
    total_employees = Employee.objects.all().count()
    departments = Department.objects.all()
    total_department = departments.count()
    total_division = Division.objects.all().count()
    total_attendance = Attendance.objects.filter(department__in=departments).count()
    
    # Use utility function for attendance stats
    department_list, attendance_list = get_attendance_stats(departments)

    context = {
        'page_title': "Administrative Dashboard",
        'total_employees': total_employees,
        'total_manager': total_manager,
        'total_division': total_division,
        'total_department': total_department,
        'department_list': department_list,
        'attendance_list': attendance_list,

    }
    return render(request, 'ceo_template/home_content.html', context)




def add_manager(request):
    form = ManagerForm(request.POST or None, request.FILES or None)
    context = {'form': form, 'page_title': 'Add Manager'}
    if request.method == 'POST':
        if form.is_valid():
            first_name = form.cleaned_data.get('first_name')
            last_name = form.cleaned_data.get('last_name')
            address = form.cleaned_data.get('address')
            email = form.cleaned_data.get('email')
            gender = form.cleaned_data.get('gender')
            password = form.cleaned_data.get('password')
            division = form.cleaned_data.get('division')
            passport = request.FILES.get('profile_pic')
            fs = FileSystemStorage()
            filename = fs.save(passport.name, passport)
            passport_url = fs.url(filename)
            try:
                user = CustomUser.objects.create_user(
                    email=email, password=password, user_type=2, first_name=first_name, last_name=last_name, profile_pic=passport_url)
                user.gender = gender
                user.address = address
                user.manager.division = division
                user.save()
                messages.success(request, "Successfully Added")
                return redirect(reverse('add_manager'))

            except Exception as e:
                messages.error(request, "Could Not Add " + str(e))
        else:
            messages.error(request, "Please fulfil all requirements")

    return render(request, 'ceo_template/add_manager_template.html', context)


def add_employee(request):
    employee_form = EmployeeForm(request.POST or None, request.FILES or None)
    context = {'form': employee_form, 'page_title': 'Add Employee'}
    if request.method == 'POST':
        if employee_form.is_valid():
            first_name = employee_form.cleaned_data.get('first_name')
            last_name = employee_form.cleaned_data.get('last_name')
            address = employee_form.cleaned_data.get('address')
            email = employee_form.cleaned_data.get('email')
            gender = employee_form.cleaned_data.get('gender')
            password = employee_form.cleaned_data.get('password')
            division = employee_form.cleaned_data.get('division')
            department = employee_form.cleaned_data.get('department')
            passport = request.FILES['profile_pic']
            fs = FileSystemStorage()
            filename = fs.save(passport.name, passport)
            passport_url = fs.url(filename)
            try:
                user = CustomUser.objects.create_user(
                    email=email, password=password, user_type=3, first_name=first_name, last_name=last_name, profile_pic=passport_url)
                user.gender = gender
                user.address = address
                user.employee.division = division
                user.employee.department = department
                user.save()
                messages.success(request, "Successfully Added")
                return redirect(reverse('add_employee'))
            except Exception as e:
                messages.error(request, "Could Not Add: " + str(e))
        else:
            messages.error(request, "Could Not Add: ")
    return render(request, 'ceo_template/add_employee_template.html', context)


def add_division(request):
    form = DivisionForm(request.POST or None)
    context = {
        'form': form,
        'page_title': 'Add Division'
    }
    if request.method == 'POST':
        if form.is_valid():
            name = form.cleaned_data.get('name')
            try:
                division = Division()
                division.name = name
                division.save()
                messages.success(request, "Successfully Added")
                return redirect(reverse('add_division'))
            except:
                messages.error(request, "Could Not Add")
        else:
            messages.error(request, "Could Not Add")
    return render(request, 'ceo_template/add_division_template.html', context)


def add_department(request):
    form = DepartmentForm(request.POST or None)
    context = {
        'form': form,
        'page_title': 'Add Department'
    }
    if request.method == 'POST':
        if form.is_valid():
            name = form.cleaned_data.get('name')
            division = form.cleaned_data.get('division')
            try:
                department = Department()
                department.name = name
                department.division = division
                department.save()
                messages.success(request, "Successfully Added")
                return redirect(reverse('add_department'))

            except Exception as e:
                messages.error(request, "Could Not Add " + str(e))
        else:
            messages.error(request, "Fill Form Properly")

    return render(request, 'ceo_template/add_department_template.html', context)


def manage_manager(request):
    allManager = CustomUser.objects.filter(user_type=2)
    context = {
        'allManager': allManager,
        'page_title': 'Manage Manager'
    }
    return render(request, "ceo_template/manage_manager.html", context)


def manage_employee(request):
    # Show ALL users that have Employee records, regardless of their primary user_type
    from .models import Employee
    employee_users = Employee.objects.select_related('admin').all()
    # Extract the CustomUser objects from Employee records
    employees = [emp.admin for emp in employee_users]
    
    context = {
        'employees': employees,
        'employee_records': employee_users,  # Pass employee records for template
        'page_title': 'Manage Employees'
    }
    return render(request, "ceo_template/manage_employee.html", context)


def manage_division(request):
    divisions = Division.objects.all()
    context = {
        'divisions': divisions,
        'page_title': 'Manage Divisions'
    }
    return render(request, "ceo_template/manage_division.html", context)


def manage_department(request):
    departments = Department.objects.all()
    context = {
        'departments': departments,
        'page_title': 'Manage Departments'
    }
    return render(request, "ceo_template/manage_department.html", context)


def customers_manage(request):
    """Enhanced customer management with filtering and pagination"""
    # Get filter parameters
    search_query = request.GET.get('search', '')
    city_filter = request.GET.get('city', '')
    active_filter = request.GET.get('active', '')
    
    # Base queryset
    customers = Customer.objects.select_related('city', 'owner_staff__admin').order_by('-created_at')
    
    # Apply filters
    if search_query:
        from django.db import models
        customers = customers.filter(
            models.Q(name__icontains=search_query) |
            models.Q(code__icontains=search_query) |
            models.Q(email__icontains=search_query) |
            models.Q(phone_primary__icontains=search_query)
        )
    
    if city_filter:
        customers = customers.filter(city_id=city_filter)
    
    if active_filter:
        customers = customers.filter(active=active_filter == 'true')
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(customers, 20)
    page_number = request.GET.get('page')
    customers_page = paginator.get_page(page_number)
    
    # Statistics
    total_customers = Customer.objects.count()
    active_customers = Customer.objects.filter(active=True).count()
    inactive_customers = Customer.objects.filter(active=False).count()
    
    # Get cities for filter dropdown
    cities = City.objects.all().order_by('name')
    
    context = {
        'customers': customers_page,
        'total_customers': total_customers,
        'active_customers': active_customers,
        'inactive_customers': inactive_customers,
        'cities': cities,
        'current_filters': {
            'search': search_query,
            'city': city_filter,
            'active': active_filter,
        },
        'page_title': 'Customer Management'
    }
    return render(request, "ceo_template/customers_manage.html", context)


def customer_add(request):
    form = CustomerForm(request.POST or None)
    context = {'form': form, 'page_title': 'Add Customer'}
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, "Customer added")
            return redirect(reverse('customers_manage'))
        else:
            messages.error(request, "Please fix the errors")
    return render(request, 'ceo_template/customer_form.html', context)


def customer_edit(request, customer_id):
    instance = get_object_or_404(Customer, id=customer_id)
    form = CustomerForm(request.POST or None, instance=instance)
    context = {'form': form, 'page_title': 'Edit Customer'}
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, "Customer updated")
            return redirect(reverse('customers_manage'))
        else:
            messages.error(request, "Please fix the errors")
    return render(request, 'ceo_template/customer_form.html', context)


def customer_delete(request, customer_id):
    instance = get_object_or_404(Customer, id=customer_id)
    instance.delete()
    messages.success(request, "Customer deleted")
    return redirect(reverse('customers_manage'))


def customer_toggle_status(request, customer_id):
    """Toggle customer active status via AJAX"""
    if request.method == 'POST':
        try:
            customer = get_object_or_404(Customer, id=customer_id)
            customer.active = not customer.active
            customer.save()
            
            status = 'activated' if customer.active else 'deactivated'
            return JsonResponse({
                'success': True,
                'message': f'Customer "{customer.name}" {status} successfully!',
                'active': customer.active
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)


def edit_manager(request, manager_id):
    manager = get_object_or_404(Manager, id=manager_id)
    form = ManagerForm(request.POST or None, instance=manager)
    context = {
        'form': form,
        'manager_id': manager_id,
        'page_title': 'Edit Manager'
    }
    if request.method == 'POST':
        if form.is_valid():
            first_name = form.cleaned_data.get('first_name')
            last_name = form.cleaned_data.get('last_name')
            address = form.cleaned_data.get('address')
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            gender = form.cleaned_data.get('gender')
            password = form.cleaned_data.get('password') or None
            division = form.cleaned_data.get('division')
            passport = request.FILES.get('profile_pic') or None
            try:
                user = CustomUser.objects.get(id=manager.admin.id)
                user.username = username
                user.email = email
                if password != None:
                    user.set_password(password)
                if passport != None:
                    fs = FileSystemStorage()
                    filename = fs.save(passport.name, passport)
                    passport_url = fs.url(filename)
                    user.profile_pic = passport_url
                user.first_name = first_name
                user.last_name = last_name
                user.gender = gender
                user.address = address
                manager.division = division
                user.save()
                manager.save()
                messages.success(request, "Successfully Updated")
                return redirect(reverse('edit_manager', args=[manager_id]))
            except Exception as e:
                messages.error(request, "Could Not Update " + str(e))
        else:
            messages.error(request, "Please fil form properly")
    else:
        user = CustomUser.objects.get(id=manager_id)
        manager = Manager.objects.get(id=user.id)
        return render(request, "ceo_template/edit_manager_template.html", context)


def edit_employee(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    form = EmployeeForm(request.POST or None, instance=employee)
    context = {
        'form': form,
        'employee_id': employee_id,
        'page_title': 'Edit Employee'
    }
    if request.method == 'POST':
        if form.is_valid():
            first_name = form.cleaned_data.get('first_name')
            last_name = form.cleaned_data.get('last_name')
            address = form.cleaned_data.get('address')
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            gender = form.cleaned_data.get('gender')
            password = form.cleaned_data.get('password') or None
            division = form.cleaned_data.get('division')
            department = form.cleaned_data.get('department')
            passport = request.FILES.get('profile_pic') or None
            try:
                user = CustomUser.objects.get(id=employee.admin.id)
                if passport != None:
                    fs = FileSystemStorage()
                    filename = fs.save(passport.name, passport)
                    passport_url = fs.url(filename)
                    user.profile_pic = passport_url
                user.username = username
                user.email = email
                if password != None:
                    user.set_password(password)
                user.first_name = first_name
                user.last_name = last_name
                user.gender = gender
                user.address = address
                employee.division = division
                employee.department = department
                user.save()
                employee.save()
                messages.success(request, "Successfully Updated")
                return redirect(reverse('edit_employee', args=[employee_id]))
            except Exception as e:
                messages.error(request, "Could Not Update " + str(e))
        else:
            messages.error(request, "Please Fill Form Properly!")
    else:
        return render(request, "ceo_template/edit_employee_template.html", context)


def edit_division(request, division_id):
    instance = get_object_or_404(Division, id=division_id)
    form = DivisionForm(request.POST or None, instance=instance)
    context = {
        'form': form,
        'division_id': division_id,
        'page_title': 'Edit Division'
    }
    if request.method == 'POST':
        if form.is_valid():
            name = form.cleaned_data.get('name')
            try:
                division = Division.objects.get(id=division_id)
                division.name = name
                division.save()
                messages.success(request, "Successfully Updated")
            except:
                messages.error(request, "Could Not Update")
        else:
            messages.error(request, "Could Not Update")

    return render(request, 'ceo_template/edit_division_template.html', context)


def edit_department(request, department_id):
    instance = get_object_or_404(Department, id=department_id)
    form = DepartmentForm(request.POST or None, instance=instance)
    context = {
        'form': form,
        'department_id': department_id,
        'page_title': 'Edit Department'
    }
    if request.method == 'POST':
        if form.is_valid():
            name = form.cleaned_data.get('name')
            division = form.cleaned_data.get('division')
            try:
                department = Department.objects.get(id=department_id)
                department.name = name
                department.division = division
                department.save()
                messages.success(request, "Successfully Updated")
                return redirect(reverse('edit_department', args=[department_id]))
            except Exception as e:
                messages.error(request, "Could Not Add " + str(e))
        else:
            messages.error(request, "Fill Form Properly")
    return render(request, 'ceo_template/edit_department_template.html', context)


@csrf_exempt
def check_email_availability(request):
    email = request.POST.get("email")
    try:
        user = CustomUser.objects.filter(email=email).exists()
        if user:
            return HttpResponse(True)
        return HttpResponse(False)
    except Exception as e:
        return HttpResponse(False)


@csrf_exempt
def employee_feedback_message(request):
    if request.method != 'POST':
        feedbacks = FeedbackEmployee.objects.all()
        context = {
            'feedbacks': feedbacks,
            'page_title': 'Employee Feedback Messages'
        }
        return render(request, 'ceo_template/employee_feedback_template.html', context)
    else:
        feedback_id = request.POST.get('id')
        try:
            feedback = get_object_or_404(FeedbackEmployee, id=feedback_id)
            reply = request.POST.get('reply')
            feedback.reply = reply
            feedback.save()
            return HttpResponse(True)
        except Exception as e:
            return HttpResponse(False)


@csrf_exempt
def manager_feedback_message(request):
    if request.method != 'POST':
        feedbacks = FeedbackManager.objects.all()
        context = {
            'feedbacks': feedbacks,
            'page_title': 'Manager Feedback Messages'
        }
        return render(request, 'ceo_template/manager_feedback_template.html', context)
    else:
        feedback_id = request.POST.get('id')
        try:
            feedback = get_object_or_404(FeedbackManager, id=feedback_id)
            reply = request.POST.get('reply')
            feedback.reply = reply
            feedback.save()
            return HttpResponse(True)
        except Exception as e:
            return HttpResponse(False)


@csrf_exempt
def view_manager_leave(request):
    if request.method != 'POST':
        allLeave = LeaveReportManager.objects.all()
        context = {
            'allLeave': allLeave,
            'page_title': 'Leave Applications From Manager'
        }
        return render(request, "ceo_template/manager_leave_view.html", context)
    else:
        id = request.POST.get('id')
        status = request.POST.get('status')
        if (status == '1'):
            status = 1
        else:
            status = -1
        try:
            leave = get_object_or_404(LeaveReportManager, id=id)
            leave.status = status
            leave.save()
            return HttpResponse(True)
        except Exception as e:
            return False


@csrf_exempt
def view_employee_leave(request):
    if request.method != 'POST':
        allLeave = LeaveReportEmployee.objects.all()
        context = {
            'allLeave': allLeave,
            'page_title': 'Leave Applications From Employees'
        }
        return render(request, "ceo_template/employee_leave_view.html", context)
    else:
        id = request.POST.get('id')
        status = request.POST.get('status')
        if (status == '1'):
            status = 1
        else:
            status = -1
        try:
            leave = get_object_or_404(LeaveReportEmployee, id=id)
            leave.status = status
            leave.save()
            return HttpResponse(True)
        except Exception as e:
            return False


def admin_view_attendance(request):
    departments = Department.objects.all()
    context = {
        'departments': departments,
        'page_title': 'View Attendance'
    }

    return render(request, "ceo_template/admin_view_attendance.html", context)


@csrf_exempt
def get_admin_attendance(request):
    department_id = request.POST.get('department')
    attendance_date_id = request.POST.get('attendance_date_id')
    try:
        department = get_object_or_404(Department, id=department_id)
        attendance = get_object_or_404(Attendance, id=attendance_date_id)
        attendance_reports = AttendanceReport.objects.filter(attendance=attendance)
        json_data = []
        for report in attendance_reports:
            data = {
                "status": str(report.status),
                "name": str(report.employee)
            }
            json_data.append(data)
        return JsonResponse(json.dumps(json_data), safe=False)
    except Exception as e:
        return None


def admin_view_profile(request):
    admin = get_object_or_404(Admin, admin=request.user)
    form = AdminForm(request.POST or None, request.FILES or None,
                     instance=admin)
    context = {'form': form,
               'page_title': 'View/Edit Profile'
               }
    if request.method == 'POST':
        try:
            if form.is_valid():
                first_name = form.cleaned_data.get('first_name')
                last_name = form.cleaned_data.get('last_name')
                password = form.cleaned_data.get('password') or None
                passport = request.FILES.get('profile_pic') or None
                custom_user = admin.admin
                if password != None:
                    custom_user.set_password(password)
                if passport != None:
                    fs = FileSystemStorage()
                    filename = fs.save(passport.name, passport)
                    passport_url = fs.url(filename)
                    custom_user.profile_pic = passport_url
                custom_user.first_name = first_name
                custom_user.last_name = last_name
                custom_user.save()
                messages.success(request, "Profile Updated!")
                return redirect(reverse('admin_view_profile'))
            else:
                messages.error(request, "Invalid Data Provided")
        except Exception as e:
            messages.error(
                request, "Error Occured While Updating Profile " + str(e))
    return render(request, "ceo_template/admin_view_profile.html", context)


def admin_notify_manager(request):
    manager = CustomUser.objects.filter(user_type=2)
    context = {
        'page_title': "Send Notifications To Manager",
        'allManager': manager
    }
    return render(request, "ceo_template/manager_notification.html", context)


def admin_notify_employee(request):
    employee = CustomUser.objects.filter(user_type=3)
    context = {
        'page_title': "Send Notifications To Employees",
        'employees': employee
    }
    return render(request, "ceo_template/employee_notification.html", context)


@csrf_exempt
def send_employee_notification(request):
    id = request.POST.get('id')
    message = request.POST.get('message')
    employee = get_object_or_404(Employee, admin_id=id)
    try:
        url = "https://fcm.googleapis.com/fcm/send"
        body = {
            'notification': {
                'title': "Axpect Technologies Textile OTM",
                'body': message,
                'click_action': reverse('employee_view_notification'),
                'icon': static('dist/img/AdminLTELogo.png')
            },
            'to': employee.admin.fcm_token
        }
        headers = {'Authorization':
                   'key=AAAA3Bm8j_M:APA91bElZlOLetwV696SoEtgzpJr2qbxBfxVBfDWFiopBWzfCfzQp2nRyC7_A2mlukZEHV4g1AmyC6P_HonvSkY2YyliKt5tT3fe_1lrKod2Daigzhb2xnYQMxUWjCAIQcUexAMPZePB',
                   'Content-Type': 'application/json'}
        data = requests.post(url, data=json.dumps(body), headers=headers)
        notification = NotificationEmployee(employee=employee, message=message)
        notification.save()
        return HttpResponse("True")
    except Exception as e:
        return HttpResponse("False")


@csrf_exempt
def send_manager_notification(request):
    id = request.POST.get('id')
    message = request.POST.get('message')
    manager = get_object_or_404(Manager, admin_id=id)
    try:
        url = "https://fcm.googleapis.com/fcm/send"
        body = {
            'notification': {
                'title': "Axpect Technologies Textile OTM",
                'body': message,
                'click_action': reverse('manager_view_notification'),
                'icon': static('dist/img/AdminLTELogo.png')
            },
            'to': manager.admin.fcm_token
        }
        headers = {'Authorization':
                   'key=AAAA3Bm8j_M:APA91bElZlOLetwV696SoEtgzpJr2qbxBfxVBfDWFiopBWzfCfzQp2nRyC7_A2mlukZEHV4g1AmyC6P_HonvSkY2YyliKt5tT3fe_1lrKod2Daigzhb2xnYQMxUWjCAIQcUexAMPZePB',
                   'Content-Type': 'application/json'}
        data = requests.post(url, data=json.dumps(body), headers=headers)
        notification = NotificationManager(manager=manager, message=message)
        notification.save()
        return HttpResponse("True")
    except Exception as e:
        return HttpResponse("False")


def delete_manager(request, manager_id):
    manager = get_object_or_404(CustomUser, manager__id=manager_id)
    manager.delete()
    messages.success(request, "Manager deleted successfully!")
    return redirect(reverse('manage_manager'))


def delete_employee(request, employee_id):
    employee = get_object_or_404(CustomUser, employee__id=employee_id)
    employee.delete()
    messages.success(request, "Employee deleted successfully!")
    return redirect(reverse('manage_employee'))


def delete_division(request, division_id):
    division = get_object_or_404(Division, id=division_id)
    try:
        division.delete()
        messages.success(request, "Division deleted successfully!")
    except Exception:
        messages.error(
            request, "Sorry, some employees are assigned to this division already. Kindly change the affected employee division and try again")
    return redirect(reverse('manage_division'))


def delete_department(request, department_id):
    department = get_object_or_404(Department, id=department_id)
    department.delete()
    messages.success(request, "Department deleted successfully!")
    return redirect(reverse('manage_department'))






# ===============================
# CUSTOMER MANAGEMENT VIEWS
# ===============================

def admin_customer_list(request):
    """Admin view to list and manage all customers"""
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can access this page.")
        return redirect('login_page')
    
    # Get filter parameters
    search_query = request.GET.get('search', '')
    city_filter = request.GET.get('city', '')
    active_filter = request.GET.get('active', '')
    
    # Base queryset
    customers = Customer.objects.select_related('city', 'owner_staff').order_by('-created_at')
    
    # Apply filters
    if search_query:
        customers = customers.filter(
            models.Q(name__icontains=search_query) |
            models.Q(code__icontains=search_query) |
            models.Q(email__icontains=search_query) |
            models.Q(phone_primary__icontains=search_query)
        )
    
    if city_filter:
        customers = customers.filter(city_id=city_filter)
    
    if active_filter:
        customers = customers.filter(active=active_filter == 'true')
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(customers, 20)
    page_number = request.GET.get('page')
    customers_page = paginator.get_page(page_number)
    
    # Statistics
    total_customers = Customer.objects.count()
    active_customers = Customer.objects.filter(active=True).count()
    inactive_customers = Customer.objects.filter(active=False).count()
    
    # Get cities for filter dropdown
    cities = City.objects.all().order_by('name')
    
    context = {
        'page_title': 'Customer Management',
        'customers': customers_page,
        'total_customers': total_customers,
        'active_customers': active_customers,
        'inactive_customers': inactive_customers,
        'cities': cities,
        'current_filters': {
            'search': search_query,
            'city': city_filter,
            'active': active_filter,
        }
    }
    return render(request, 'ceo_template/customer_list.html', context)


def admin_customer_create(request):
    """Admin view to create new customers"""
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can access this page.")
        return redirect('login_page')
    
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            customer = form.save()
            messages.success(request, f'Customer "{customer.name}" created successfully!')
            return redirect('admin_customer_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CustomerForm()
    
    context = {
        'page_title': 'Add New Customer',
        'form': form,
        'form_action': 'Create'
    }
    return render(request, 'ceo_template/customer_form.html', context)


def admin_customer_edit(request, customer_id):
    """Admin view to edit existing customers"""
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can access this page.")
        return redirect('login_page')
    
    customer = get_object_or_404(Customer, id=customer_id)
    
    if request.method == 'POST':
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            customer = form.save()
            messages.success(request, f'Customer "{customer.name}" updated successfully!')
            return redirect('admin_customer_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CustomerForm(instance=customer)
    
    context = {
        'page_title': 'Edit Customer',
        'form': form,
        'form_action': 'Update',
        'customer': customer
    }
    return render(request, 'ceo_template/customer_form.html', context)


def admin_customer_delete(request, customer_id):
    """Admin view to delete customers"""
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can access this page.")
        return redirect('login_page')
    
    customer = get_object_or_404(Customer, id=customer_id)
    
    if request.method == 'POST':
        customer_name = customer.name
        customer.delete()
        messages.success(request, f'Customer "{customer_name}" deleted successfully!')
        return redirect('admin_customer_list')
    
    context = {
        'page_title': 'Delete Customer',
        'customer': customer
    }
    return render(request, 'ceo_template/customer_delete.html', context)


def admin_customer_toggle_status(request, customer_id):
    """Admin view to toggle customer active status"""
    if request.user.user_type != '1':
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    try:
        customer = get_object_or_404(Customer, id=customer_id)
        customer.active = not customer.active
        customer.save()
        
        status = 'activated' if customer.active else 'deactivated'
        return JsonResponse({
            'success': True,
            'message': f'Customer "{customer.name}" {status} successfully!',
            'active': customer.active
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def communication_dashboard(request):
    """
    Communication log timeline dashboard for viewing customer interactions
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can view this page.")
        return redirect('login_page')
    
    # Get filter parameters
    customer_id = request.GET.get('customer_id')
    employee_id = request.GET.get('employee_id')
    channel = request.GET.get('channel')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # Base queryset
    communications = CommunicationLog.objects.all().order_by('-timestamp')
    
    # Apply filters
    if customer_id:
        communications = communications.filter(customer_id=customer_id)
    if employee_id:
        communications = communications.filter(user_id=employee_id)
    if channel:
        communications = communications.filter(channel=channel)
    if date_from:
        communications = communications.filter(timestamp__date__gte=date_from)
    if date_to:
        communications = communications.filter(timestamp__date__lte=date_to)
    
    # Get filter options
    customers = Customer.objects.all().order_by('name')
    employees = CustomUser.objects.filter(user_type__in=['2', '3']).order_by('first_name')
    channels = CommunicationLog.objects.values_list('channel', flat=True).distinct()
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(communications, 50)  # 50 items per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'communications': page_obj,
        'customers': customers,
        'employees': employees,
        'channels': channels,
        'filters': {
            'customer_id': customer_id,
            'employee_id': employee_id,
            'channel': channel,
            'date_from': date_from,
            'date_to': date_to,
        }
    }
    
    return render(request, 'ceo_template/communication_dashboard.html', context)


def business_calendar(request):
    """
    Business calendar management for holidays and working days
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can view this page.")
        return redirect('login_page')
    
    # Get filter parameters
    year = request.GET.get('year', timezone.now().year)
    month = request.GET.get('month', timezone.now().month)
    city_id = request.GET.get('city_id')
    
    try:
        year = int(year)
        month = int(month)
    except (ValueError, TypeError):
        year = timezone.now().year
        month = timezone.now().month
    
    # Get calendar entries for the month
    start_date = datetime(year, month, 1).date()
    if month == 12:
        end_date = datetime(year + 1, 1, 1).date()
    else:
        end_date = datetime(year, month + 1, 1).date()
    
    calendar_entries = BusinessCalendar.objects.filter(
        date__gte=start_date,
        date__lt=end_date
    )
    
    if city_id:
        calendar_entries = calendar_entries.filter(
            Q(city_id=city_id) | Q(applies_to_all=True)
        )
    
    # Get cities for filter
    cities = City.objects.all().order_by('name')
    
    # Create calendar grid
    import calendar
    cal = calendar.monthcalendar(year, month)
    
    # Prepare calendar data
    calendar_data = []
    for week in cal:
        week_data = []
        for day in week:
            if day == 0:
                week_data.append(None)
            else:
                day_date = datetime(year, month, day).date()
                day_entries = calendar_entries.filter(date=day_date)
                
                day_info = {
                    'day': day,
                    'date': day_date,
                    'is_working_day': True,
                    'is_holiday': False,
                    'holiday_name': '',
                    'entries': list(day_entries)
                }
                
                if day_entries.exists():
                    entry = day_entries.first()
                    day_info['is_working_day'] = entry.is_working_day
                    day_info['is_holiday'] = entry.is_holiday
                    day_info['holiday_name'] = entry.holiday_name
                
                week_data.append(day_info)
        calendar_data.append(week_data)
    
    context = {
        'calendar_data': calendar_data,
        'year': year,
        'month': month,
        'month_name': calendar.month_name[month],
        'cities': cities,
        'selected_city_id': city_id,
        'prev_month': month - 1 if month > 1 else 12,
        'prev_year': year if month > 1 else year - 1,
        'next_month': month + 1 if month < 12 else 1,
        'next_year': year if month < 12 else year + 1,
    }
    
    return render(request, 'ceo_template/business_calendar.html', context)


def add_holiday(request):
    """
    Add a new holiday to the business calendar
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    if request.method == 'POST':
        date_str = request.POST.get('date')
        holiday_name = request.POST.get('holiday_name')
        city_id = request.POST.get('city_id')
        applies_to_all = request.POST.get('applies_to_all') == 'on'
        notes = request.POST.get('notes', '')
        
        try:
            holiday_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # Create or update calendar entry
            calendar_entry, created = BusinessCalendar.objects.get_or_create(
                date=holiday_date,
                defaults={
                    'is_working_day': False,
                    'is_holiday': True,
                    'holiday_name': holiday_name,
                    'notes': notes,
                    'applies_to_all': applies_to_all,
                    'city_id': city_id if not applies_to_all else None
                }
            )
            
            if not created:
                calendar_entry.is_working_day = False
                calendar_entry.is_holiday = True
                calendar_entry.holiday_name = holiday_name
                calendar_entry.notes = notes
                calendar_entry.applies_to_all = applies_to_all
                calendar_entry.city_id = city_id if not applies_to_all else None
                calendar_entry.save()
            
            messages.success(request, f'Holiday "{holiday_name}" added successfully!')
            
        except ValueError:
            messages.error(request, 'Invalid date format.')
        except Exception as e:
            messages.error(request, f'Error adding holiday: {str(e)}')
    
    return redirect('business_calendar')


def edit_holiday(request, entry_id):
    """
    Edit an existing calendar entry
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    try:
        entry = BusinessCalendar.objects.get(id=entry_id)
    except BusinessCalendar.DoesNotExist:
        messages.error(request, 'Calendar entry not found.')
        return redirect('business_calendar')
    
    if request.method == 'POST':
        entry.is_working_day = request.POST.get('is_working_day') == 'on'
        entry.is_holiday = request.POST.get('is_holiday') == 'on'
        entry.holiday_name = request.POST.get('holiday_name', '')
        entry.notes = request.POST.get('notes', '')
        entry.applies_to_all = request.POST.get('applies_to_all') == 'on'
        
        city_id = request.POST.get('city_id')
        entry.city_id = city_id if not entry.applies_to_all else None
        
        entry.save()
        messages.success(request, 'Calendar entry updated successfully!')
        return redirect('business_calendar')
    
    cities = City.objects.all().order_by('name')
    context = {
        'entry': entry,
        'cities': cities
    }
    
    return render(request, 'ceo_template/edit_holiday.html', context)


def delete_holiday(request, entry_id):
    """
    Delete a calendar entry
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    try:
        entry = BusinessCalendar.objects.get(id=entry_id)
        entry.delete()
        messages.success(request, 'Calendar entry deleted successfully!')
    except BusinessCalendar.DoesNotExist:
        messages.error(request, 'Calendar entry not found.')
    
    return redirect('business_calendar')


def price_list_manage(request):
    """
    Price list management interface for admins
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can view this page.")
        return redirect('login_page')
    
    # Get filter parameters
    item_id = request.GET.get('item_id')
    city_id = request.GET.get('city_id')
    is_active = request.GET.get('is_active')
    
    # Base queryset
    price_lists = PriceList.objects.all().order_by('-effective_date')
    
    # Apply filters
    if item_id:
        price_lists = price_lists.filter(item_id=item_id)
    if city_id:
        price_lists = price_lists.filter(city_id=city_id)
    if is_active is not None:
        price_lists = price_lists.filter(is_active=is_active == 'true')
    
    # Get filter options
    items = Item.objects.all().order_by('name')
    cities = City.objects.all().order_by('name')
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(price_lists, 50)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'price_lists': page_obj,
        'items': items,
        'cities': cities,
        'filters': {
            'item_id': item_id,
            'city_id': city_id,
            'is_active': is_active,
        }
    }
    
    return render(request, 'ceo_template/price_list_manage.html', context)


def add_price_list(request):
    """
    Add a new price list entry
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    if request.method == 'POST':
        item_id = request.POST.get('item_id')
        city_id = request.POST.get('city_id')
        rate = request.POST.get('rate')
        effective_from = request.POST.get('effective_from')
        effective_to = request.POST.get('effective_to')
        is_active = request.POST.get('is_active') == 'on'
        
        try:
            rate_decimal = float(rate)
            effective_from_date = datetime.strptime(effective_from, '%Y-%m-%d').date()
            effective_to_date = datetime.strptime(effective_to, '%Y-%m-%d').date() if effective_to else None
            
            price_list = PriceList.objects.create(
                item_id=item_id,
                city_id=city_id,
                rate=rate_decimal,
                effective_from=effective_from_date,
                effective_to=effective_to_date,
                is_active=is_active
            )
            
            messages.success(request, f'Price list entry added successfully!')
            
        except ValueError as e:
            messages.error(request, f'Invalid data format: {str(e)}')
        except Exception as e:
            messages.error(request, f'Error adding price list: {str(e)}')
    
    return redirect('price_list_manage')


def edit_price_list(request, price_list_id):
    """
    Edit an existing price list entry
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    try:
        price_list = PriceList.objects.get(id=price_list_id)
    except PriceList.DoesNotExist:
        messages.error(request, 'Price list entry not found.')
        return redirect('price_list_manage')
    
    if request.method == 'POST':
        price_list.item_id = request.POST.get('item_id')
        price_list.city_id = request.POST.get('city_id')
        price_list.rate = float(request.POST.get('rate'))
        price_list.effective_from = datetime.strptime(request.POST.get('effective_from'), '%Y-%m-%d').date()
        
        effective_to = request.POST.get('effective_to')
        price_list.effective_to = datetime.strptime(effective_to, '%Y-%m-%d').date() if effective_to else None
        
        price_list.is_active = request.POST.get('is_active') == 'on'
        price_list.save()
        
        messages.success(request, 'Price list entry updated successfully!')
        return redirect('price_list_manage')
    
    items = Item.objects.all().order_by('name')
    cities = City.objects.all().order_by('name')
    
    context = {
        'price_list': price_list,
        'items': items,
        'cities': cities
    }
    
    return render(request, 'ceo_template/edit_price_list.html', context)


def delete_price_list(request, price_list_id):
    """
    Delete a price list entry
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    try:
        price_list = PriceList.objects.get(id=price_list_id)
        price_list.delete()
        messages.success(request, 'Price list entry deleted successfully!')
    except PriceList.DoesNotExist:
        messages.error(request, 'Price list entry not found.')
    
    return redirect('price_list_manage')


def rate_alerts(request):
    """
    Rate alert configuration interface
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can view this page.")
        return redirect('login_page')
    
    # Get filter parameters
    item_id = request.GET.get('item_id')
    city_id = request.GET.get('city_id')
    is_active = request.GET.get('is_active')
    
    # Base queryset
    rate_alerts = RateAlert.objects.all().order_by('-effective_at')
    
    # Apply filters
    if item_id:
        rate_alerts = rate_alerts.filter(item_id=item_id)
    if city_id:
        rate_alerts = rate_alerts.filter(city_id=city_id)
    if is_active is not None:
        rate_alerts = rate_alerts.filter(is_active=is_active == 'true')
    
    # Get filter options
    items = Item.objects.all().order_by('name')
    cities = City.objects.all().order_by('name')
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(rate_alerts, 50)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'rate_alerts': page_obj,
        'items': items,
        'cities': cities,
        'filters': {
            'item_id': item_id,
            'city_id': city_id,
            'is_active': is_active,
        }
    }
    
    return render(request, 'ceo_template/rate_alerts.html', context)


def create_rate_alert(request):
    """
    Create a new rate alert
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    if request.method == 'POST':
        item_id = request.POST.get('item_id')
        city_id = request.POST.get('city_id')
        threshold_percentage = request.POST.get('threshold_percentage')
        direction = request.POST.get('direction')
        is_active = request.POST.get('is_active') == 'on'
        
        try:
            threshold_decimal = float(threshold_percentage)
            
            rate_alert = RateAlert.objects.create(
                item_id=item_id,
                city_id=city_id,
                threshold_percentage=threshold_decimal,
                direction=direction,
                is_active=is_active
            )
            
            messages.success(request, f'Rate alert created successfully!')
            
        except ValueError as e:
            messages.error(request, f'Invalid data format: {str(e)}')
        except Exception as e:
            messages.error(request, f'Error creating rate alert: {str(e)}')
    
    return redirect('rate_alerts')


def edit_rate_alert(request, alert_id):
    """
    Edit an existing rate alert
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    try:
        rate_alert = RateAlert.objects.get(id=alert_id)
    except RateAlert.DoesNotExist:
        messages.error(request, 'Rate alert not found.')
        return redirect('rate_alerts')
    
    if request.method == 'POST':
        rate_alert.item_id = request.POST.get('item_id')
        rate_alert.city_id = request.POST.get('city_id')
        rate_alert.threshold_percentage = float(request.POST.get('threshold_percentage'))
        rate_alert.direction = request.POST.get('direction')
        rate_alert.is_active = request.POST.get('is_active') == 'on'
        rate_alert.save()
        
        messages.success(request, 'Rate alert updated successfully!')
        return redirect('rate_alerts')
    
    items = Item.objects.all().order_by('name')
    cities = City.objects.all().order_by('name')
    
    context = {
        'rate_alert': rate_alert,
        'items': items,
        'cities': cities
    }
    
    return render(request, 'ceo_template/edit_rate_alert.html', context)


def delete_rate_alert(request, alert_id):
    """
    Delete a rate alert
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    try:
        rate_alert = RateAlert.objects.get(id=alert_id)
        rate_alert.delete()
        messages.success(request, 'Rate alert deleted successfully!')
    except RateAlert.DoesNotExist:
        messages.error(request, 'Rate alert not found.')
    
    return redirect('rate_alerts')


def staff_capabilities_matrix(request):
    """
    Staff capability matrix management interface
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can view this page.")
        return redirect('login_page')
    
    # Get all employees and capabilities
    employees = Employee.objects.select_related('admin', 'department').all().order_by('admin__first_name')
    staff_capabilities = StaffCapability.objects.select_related('staff__admin').all()
    
    # Get unique capabilities
    capabilities = StaffCapability.objects.values_list('capability_type', flat=True).distinct().order_by('capability_type')
    
    # Create capability matrix
    capability_matrix = {}
    for employee in employees:
        capability_matrix[employee.id] = {
            'employee': employee,
            'capabilities': {}
        }
        for capability in capabilities:
            capability_matrix[employee.id]['capabilities'][capability] = None
    
    # Fill in existing capabilities
    for staff_cap in staff_capabilities:
        if staff_cap.staff.id in capability_matrix:
            capability_matrix[staff_cap.staff.id]['capabilities'][staff_cap.capability_type] = staff_cap
    
    context = {
        'capability_matrix': capability_matrix,
        'capabilities': capabilities,
        'employees': employees
    }
    
    return render(request, 'ceo_template/capabilities_matrix.html', context)


def update_capabilities(request):
    """
    Update staff capabilities
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    if request.method == 'POST':
        employee_id = request.POST.get('employee_id')
        capability = request.POST.get('capability')
        level = request.POST.get('level')
        notes = request.POST.get('notes', '')
        
        try:
            employee = Employee.objects.get(id=employee_id)
            
            if level and level != '0':  # Level 0 means remove capability
                # Create or update capability
                staff_cap, created = StaffCapability.objects.get_or_create(
                    employee=employee,
                    capability=capability,
                    defaults={'level': int(level), 'notes': notes}
                )
                
                if not created:
                    staff_cap.level = int(level)
                    staff_cap.notes = notes
                    staff_cap.save()
                
                messages.success(request, f'Capability updated for {employee.admin.get_full_name()}')
            else:
                # Remove capability
                StaffCapability.objects.filter(
                    employee=employee,
                    capability=capability
                ).delete()
                
                messages.success(request, f'Capability removed from {employee.admin.get_full_name()}')
                
        except Employee.DoesNotExist:
            messages.error(request, 'Employee not found.')
        except Exception as e:
            messages.error(request, f'Error updating capability: {str(e)}')
    
    return redirect('staff_capabilities_matrix')


def customer_capabilities_matrix(request):
    """
    Customer capability matrix management interface
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can view this page.")
        return redirect('login_page')
    
    # Get all customers and capabilities
    customers = Customer.objects.all().order_by('name')
    customer_capabilities = CustomerCapability.objects.select_related('customer').all()
    
    # Get unique capabilities
    capabilities = CustomerCapability.objects.values_list('item__name', flat=True).distinct().order_by('item__name')
    
    # Create capability matrix
    capability_matrix = {}
    for customer in customers:
        capability_matrix[customer.id] = {
            'customer': customer,
            'capabilities': {}
        }
        for capability in capabilities:
            capability_matrix[customer.id]['capabilities'][capability] = None
    
    # Fill in existing capabilities
    for customer_cap in customer_capabilities:
        if customer_cap.customer.id in capability_matrix:
            capability_matrix[customer_cap.customer.id]['capabilities'][customer_cap.item.name] = customer_cap
    
    context = {
        'capability_matrix': capability_matrix,
        'capabilities': capabilities,
        'customers': customers
    }
    
    return render(request, 'ceo_template/customer_capabilities_matrix.html', context)


def update_customer_capabilities(request):
    """
    Update customer capabilities
    """
    if request.user.user_type != '1':
        messages.error(request, "Access denied. Only administrators can perform this action.")
        return redirect('login_page')
    
    if request.method == 'POST':
        customer_id = request.POST.get('customer_id')
        capability = request.POST.get('capability')
        level = request.POST.get('level')
        notes = request.POST.get('notes', '')
        
        try:
            customer = Customer.objects.get(id=customer_id)
            
            if level and level != '0':  # Level 0 means remove capability
                # Create or update capability
                customer_cap, created = CustomerCapability.objects.get_or_create(
                    customer=customer,
                    capability=capability,
                    defaults={'level': int(level), 'notes': notes}
                )
                
                if not created:
                    customer_cap.level = int(level)
                    customer_cap.notes = notes
                    customer_cap.save()
                
                messages.success(request, f'Capability updated for {customer.name}')
            else:
                # Remove capability
                CustomerCapability.objects.filter(
                    customer=customer,
                    capability=capability
                ).delete()
                
                messages.success(request, f'Capability removed from {customer.name}')
                
        except Customer.DoesNotExist:
            messages.error(request, 'Customer not found.')
        except Exception as e:
            messages.error(request, f'Error updating capability: {str(e)}')
    
    return redirect('customer_capabilities_matrix')


