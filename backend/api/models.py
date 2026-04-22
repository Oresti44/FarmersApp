from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class UserManager(models.Manager):
    def create_user(self, email=None, password=None, **extra_fields):
        username = extra_fields.pop("username", None)
        email = email or extra_fields.pop("email", None) or username
        if not email:
            raise ValueError("Users must have an email address.")

        full_name = extra_fields.pop("full_name", "")
        first_name = extra_fields.pop("first_name", "")
        last_name = extra_fields.pop("last_name", "")
        if not full_name:
            full_name = f"{first_name} {last_name}".strip() or email

        user = self.model(
            email=self.normalize_email(email),
            full_name=full_name,
            role=extra_fields.pop("role", "worker"),
            **extra_fields,
        )
        user.set_password(password or "")
        user.save(using=self.db)
        return user

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", "manager")
        return self.create_user(email=email, password=password, **extra_fields)

    @staticmethod
    def normalize_email(email):
        email = email or ""
        try:
            local_part, domain = email.strip().rsplit("@", 1)
        except ValueError:
            return email.strip().lower()
        return f"{local_part}@{domain.lower()}"


class User(models.Model):
    ROLE_CHOICES = [
        ("manager", "Manager"),
        ("worker", "Worker"),
    ]

    full_name = models.CharField(max_length=120)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.TextField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        ordering = ["full_name", "email"]

    @property
    def username(self):
        return self.email

    @property
    def is_staff(self):
        return self.role == "manager"

    @property
    def is_superuser(self):
        return False

    @property
    def password(self):
        return self.password_hash

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def get_full_name(self):
        return self.full_name

    def get_short_name(self):
        return self.full_name.split(" ", 1)[0] if self.full_name else self.email

    def __str__(self):
        return self.full_name or self.email


from api.modules.plants.models import *  # noqa: F401,F403
from api.modules.tasks.models import *  # noqa: F401,F403
from api.modules.finance.models import *  # noqa: F401,F403
from api.modules.inventory.models import *  # noqa: F401,F403
