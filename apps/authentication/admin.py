from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount

from .models import User


admin.site.site_header = "MVideo Admin"
admin.site.site_title = "MVideo Admin"
admin.site.index_title = "Management"


class EmailAddressInline(admin.TabularInline):
    model = EmailAddress
    extra = 0
    fields = ("email", "verified", "primary")
    readonly_fields = ("email",)
    can_delete = False
    verbose_name = "Email address"
    verbose_name_plural = "Email addresses"


class SocialAccountInline(admin.TabularInline):
    model = SocialAccount
    extra = 0
    fields = ("provider", "uid", "last_login", "date_joined")
    readonly_fields = ("provider", "uid", "last_login", "date_joined")
    can_delete = False
    verbose_name = "Social account"
    verbose_name_plural = "Social accounts"


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = (EmailAddressInline, SocialAccountInline)
    list_display = (
        "avatar_thumb",
        "email",
        "username",
        "full_name_display",
        "is_staff",
        "is_active",
        "created_at",
    )
    list_display_links = ("email", "username")
    list_filter = ("is_active", "is_staff", "is_superuser", "groups", "created_at")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    readonly_fields = ("id", "created_at", "updated_at", "last_login", "avatar_preview")
    list_per_page = 25

    fieldsets = (
        (None, {"fields": ("id", "email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "username",
                    "first_name",
                    "last_name",
                    "avatar",
                    "avatar_preview",
                    "bio",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2"),
            },
        ),
    )

    @admin.display(description="Avatar")
    def avatar_thumb(self, obj):
        if obj.avatar:
            return format_html(
                '<span class="admin-avatar-preview"><img src="{}" alt=""></span>',
                obj.avatar.url,
            )
        return "-"

    @admin.display(description="Preview")
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<span class="admin-avatar-preview"><img src="{}" alt=""></span>',
                obj.avatar.url,
            )
        return "No avatar"

    @admin.display(description="Full name")
    def full_name_display(self, obj):
        return obj.full_name or "-"
