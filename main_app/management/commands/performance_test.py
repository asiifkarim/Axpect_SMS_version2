from django.core.management.base import BaseCommand
from django.test import Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.cache import cache
import time
import statistics
import concurrent.futures

User = get_user_model()

class Command(BaseCommand):
    help = 'Performance testing for production environment'

    def add_arguments(self, parser):
        parser.add_argument(
            '--requests',
            type=int,
            default=100,
            help='Number of requests to make (default: 100)'
        )
        parser.add_argument(
            '--concurrent',
            type=int,
            default=10,
            help='Number of concurrent requests (default: 10)'
        )
        parser.add_argument(
            '--endpoint',
            type=str,
            default='/',
            help='Endpoint to test (default: /)'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting performance tests...'))
        
        client = Client()
        requests_count = options['requests']
        concurrent_requests = options['concurrent']
        endpoint = options['endpoint']
        
        # Create test user if needed
        test_user = None
        if endpoint.startswith('/api/') or endpoint.startswith('/chatbot/'):
            try:
                test_user = User.objects.get(email='test@performance.com')
            except User.DoesNotExist:
                test_user = User.objects.create_user(
                    email='test@performance.com',
                    password='testpass123',
                    first_name='Test',
                    last_name='User'
                )
            client.force_login(test_user)

        def make_request():
            start_time = time.time()
            try:
                response = client.get(endpoint)
                end_time = time.time()
                return {
                    'status_code': response.status_code,
                    'response_time': end_time - start_time,
                    'success': 200 <= response.status_code < 400
                }
            except Exception as e:
                end_time = time.time()
                return {
                    'status_code': 500,
                    'response_time': end_time - start_time,
                    'success': False,
                    'error': str(e)
                }

        # Warm up
        self.stdout.write('🔥 Warming up...')
        for _ in range(5):
            make_request()

        # Performance test
        self.stdout.write(f'📊 Testing {endpoint} with {requests_count} requests ({concurrent_requests} concurrent)...')
        
        results = []
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
            futures = [executor.submit(make_request) for _ in range(requests_count)]
            for future in concurrent.futures.as_completed(futures):
                results.append(future.result())
        
        total_time = time.time() - start_time
        
        # Analyze results
        response_times = [r['response_time'] for r in results]
        successful_requests = [r for r in results if r['success']]
        failed_requests = [r for r in results if not r['success']]
        
        # Statistics
        avg_response_time = statistics.mean(response_times)
        median_response_time = statistics.median(response_times)
        min_response_time = min(response_times)
        max_response_time = max(response_times)
        
        if len(response_times) > 1:
            std_dev = statistics.stdev(response_times)
            p95_response_time = sorted(response_times)[int(0.95 * len(response_times))]
            p99_response_time = sorted(response_times)[int(0.99 * len(response_times))]
        else:
            std_dev = 0
            p95_response_time = max_response_time
            p99_response_time = max_response_time
        
        requests_per_second = requests_count / total_time
        success_rate = (len(successful_requests) / requests_count) * 100
        
        # Display results
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('📈 PERFORMANCE TEST RESULTS'))
        self.stdout.write('='*60)
        
        self.stdout.write(f'Endpoint: {endpoint}')
        self.stdout.write(f'Total Requests: {requests_count}')
        self.stdout.write(f'Concurrent Requests: {concurrent_requests}')
        self.stdout.write(f'Total Time: {total_time:.2f}s')
        self.stdout.write(f'Requests/Second: {requests_per_second:.2f}')
        self.stdout.write(f'Success Rate: {success_rate:.1f}%')
        
        self.stdout.write('\n📊 Response Time Statistics:')
        self.stdout.write(f'  Average: {avg_response_time*1000:.2f}ms')
        self.stdout.write(f'  Median: {median_response_time*1000:.2f}ms')
        self.stdout.write(f'  Min: {min_response_time*1000:.2f}ms')
        self.stdout.write(f'  Max: {max_response_time*1000:.2f}ms')
        self.stdout.write(f'  Std Dev: {std_dev*1000:.2f}ms')
        self.stdout.write(f'  95th Percentile: {p95_response_time*1000:.2f}ms')
        self.stdout.write(f'  99th Percentile: {p99_response_time*1000:.2f}ms')
        
        if failed_requests:
            self.stdout.write(f'\n❌ Failed Requests: {len(failed_requests)}')
            error_counts = {}
            for req in failed_requests:
                status = req.get('status_code', 'Unknown')
                error_counts[status] = error_counts.get(status, 0) + 1
            
            for status, count in error_counts.items():
                self.stdout.write(f'  Status {status}: {count} requests')
        
        # Performance recommendations
        self.stdout.write('\n💡 Performance Recommendations:')
        
        if avg_response_time > 1.0:
            self.stdout.write('  ⚠️ High average response time (>1s)')
            self.stdout.write('    - Consider database query optimization')
            self.stdout.write('    - Enable caching')
            self.stdout.write('    - Review slow middleware')
        
        if success_rate < 99:
            self.stdout.write('  ⚠️ Low success rate (<99%)')
            self.stdout.write('    - Check error logs')
            self.stdout.write('    - Review resource limits')
        
        if requests_per_second < 50:
            self.stdout.write('  ⚠️ Low throughput (<50 req/s)')
            self.stdout.write('    - Consider scaling up resources')
            self.stdout.write('    - Enable connection pooling')
            self.stdout.write('    - Review ASGI configuration')
        
        # Cache performance test
        self.stdout.write('\n🗄️ Testing cache performance...')
        cache_start = time.time()
        for i in range(100):
            cache.set(f'perf_test_{i}', f'value_{i}', 60)
        cache_write_time = time.time() - cache_start
        
        cache_start = time.time()
        for i in range(100):
            cache.get(f'perf_test_{i}')
        cache_read_time = time.time() - cache_start
        
        self.stdout.write(f'Cache Write (100 ops): {cache_write_time*1000:.2f}ms')
        self.stdout.write(f'Cache Read (100 ops): {cache_read_time*1000:.2f}ms')
        
        # Cleanup
        if test_user and test_user.email == 'test@performance.com':
            test_user.delete()
        
        for i in range(100):
            cache.delete(f'perf_test_{i}')
        
        self.stdout.write('\n✅ Performance test completed!')
        
        # Return appropriate exit code
        if success_rate >= 95 and avg_response_time <= 2.0:
            return 0
        else:
            return 1
