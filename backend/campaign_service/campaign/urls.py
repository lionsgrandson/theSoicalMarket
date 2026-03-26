from django.urls import path
from . import views

urlpatterns = [
    path('create_campaign/', views.create_campaign, name='create_campaign'),
    path('get_my_all_campaigns/', views.get_my_all_campaigns, name='get_my_all_campaigns'),
    path('get_a_campaign/<int:campaign_id>/', views.get_a_campaign, name='get_a_campaign'),
    path('update_a_campaign/<int:campaign_id>/', views.update_a_campaign, name='update_a_campaign'),
    path('delete_a_campaign/<int:campaign_id>/', views.delete_a_campaign, name='delete_a_campaign'),
    path('get_all_camaign_of_all_users/', views.get_all_camaign_of_all_users, name='get_all_camaign_of_all_users'),
    path('hire_influencer/', views.hire_influencer, name='hire_influencer'),
    path('get_my_previous_hirings/', views.get_my_previous_hirings, name='get_my_previous_hirings'),
    path('get_my_previous_where_i_was_hired/', views.get_my_previous_where_i_was_hired, name='get_my_previous_where_i_was_hired'),

    path('accept_offer/<int:offer_id>/', views.accept_offer, name='accept_offer'),
    path('reject_offer/<int:offer_id>/', views.reject_offer, name='reject_offer'),

    path('complete_offer/<int:offer_id>/', views.complete_offer, name='complete_offer'),
    path('give_rating/<int:offer_id>/', views.give_rating, name='give_rating'),

    path('<int:brand_id>/get_frequent_platform/', views.frequent_platform),
    path('<int:user_id>/<int:brand_id>/hires_and_campaigns/', views.get_hires_and_campaigns),
    path("proposals/", views.ListHireView.as_view()),
    path("<int:user_id>/brand_earnings_and_hires/", views.get_hires_and_campaigns_for_influencer),
    path("search_campaign/", views.search_campaign),


    path('campaigns/', views.campaign_list, name='campaign_list'),
    path('campaigns/delete/<int:campaign_id>/', views.delete_campaign, name='delete_campaign'),

]