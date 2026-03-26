

from locust import HttpUser, task, between
import random
import string
import time

BASE_URL = "http://192.168.96.1:8000/api"  # your ngrok base URL

# --- CONFIG ---
TEST_EMAIL = "loadtest_user@test.com"
TEST_PASSWORD = "111111"

def random_string(n=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))


class DjangoLoadTestUser(HttpUser):
    wait_time = between(1, 3)  # seconds between tasks

    def on_start(self):
        """Runs once per simulated user — handles signup + login + token store."""
        self.headers = {"Content-Type": "application/json", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
        self.token = None

        # Try login directly (faster)
        self.login_or_create_user()

    def login_or_create_user(self):
        """Try login; if fails, sign up then retry login."""
        login_payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}

        login_response = self.client.post(
            f"{BASE_URL}/user_service/login/",
            json=login_payload,
            headers=self.headers,
            name="/login"
        )

        if login_response.status_code == 200:
            try:
                data = login_response.json()
                self.token = data.get("access") or data.get("token")
                self.headers["Authorization"] = f"Bearer {self.token}"
                print(f"[LOGIN OK] Token received")
                return
            except Exception as e:
                print(f"[LOGIN JSON ERROR] {e}")

        # If login failed, create account then retry
        print(f"[LOGIN FAILED] {login_response.status_code}, creating new user...")
        signup_payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "username": "loadtest_user"
        }
        signup_response = self.client.post(
            f"{BASE_URL}/user_service/signup/",
            json=signup_payload,
            headers=self.headers,
            name="/signup"
        )

        time.sleep(0.5)
        self.login_or_create_user()

    # ---------------- TASKS ---------------- #

    @task(3)
    def get_user_profile(self):
        if not self.token:
            return
        self.client.get(
            f"{BASE_URL}/user_service/profile/",
            headers=self.headers,
            name="/profile"
        )

    @task(2)
    def get_user_campaigns(self):
        if not self.token:
            return
        self.client.get(
            f"{BASE_URL}/campaign_service/list/",
            headers=self.headers,
            name="/campaigns"
        )

    @task(2)
    def create_campaign(self):
        if not self.token:
            return
        payload = {
            "title": "Campaign " + random_string(5),
            "budget": random.randint(100, 10000),
        }
        self.client.post(
            f"{BASE_URL}/campaign_service/create/",
            json=payload,
            headers=self.headers,
            name="/campaign_create"
        )

    @task(1)
    def health_check(self):
        self.client.get(f"{BASE_URL}/", name="/")

