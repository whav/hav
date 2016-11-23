from django.shortcuts import render


def debug(request):
    return render(request, 'incoming/uploader.html')