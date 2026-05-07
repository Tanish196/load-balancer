for ($i=1; $i -le 6; $i++) {
    Write-Host "Request $i"
    try {
        $response = Invoke-WebRequest -Uri http://localhost:5000/api/v1/nodes -Method Get
        Write-Host "Status: $($response.StatusCode)"
        Write-Host "Remaining: $($response.Headers['X-RateLimit-Remaining'])"
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Remaining: $($_.Exception.Response.Headers['X-RateLimit-Remaining'])"
    }
}
