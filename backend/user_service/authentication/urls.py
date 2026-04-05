from django.urls import path
from . import views
from . import matching_views


urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('get_user_info/', views.get_user_info, name='get_user_info'),
    path('update_user_profile/', views.update_user_profile, name='update_user_profile'),
    path('get_all_influencers/', views.get_all_influencers, name='get_all_influencers'),
    path('get_all_brands/', views.get_all_brands, name='get_all_brands'),
    path('get_a_brand/<int:brand_id>/', views.get_a_brand, name='get_a_brand'),
    path('get_a_influencer/<int:influencer_id>/', views.get_a_influencer, name='get_a_influencer'),
    path('send_otp/', views.send_otp, name='send_otp'),
    path('verify_email/', views.verify_email, name='verify_email'),
    path('reset_password/', views.reset_password, name='reset_password'),


    path('get_user_info_by_id/<int:user_id>/', views.get_user_info_by_id, name='get_user_info_by_id'),

    path('filter_influencers/', views.filter_influencers, name='filter_influencers'),
    # social auth
    path('social_signup_signin/', views.social_signup_signin, name='social_signup_signin'),

    path("get_featured_influencers/", views.get_featured_influencers, name="featured-influencers"),
    path("get_featured_brands/", views.get_featured_brands, name="featured-brands"),
    path("feedback/", views.create_feedback),
    path("create_log/", views.create_log),
    path('run_matching/', matching_views.run_matching, name='run_matching'),
    path('save_influencer/<int:influencer_id>/', views.save_influencer, name='save-influencer'),
    path('unsave_influencer/<int:influencer_id>/', views.unsave_influencer, name='unsave-influencer'),
    path('get_saved_influencers/', views.get_saved_influencers, name='saved-influencers'),
    path('platform_stats/', views.get_platform_stats, name='platform-stats'),

]
