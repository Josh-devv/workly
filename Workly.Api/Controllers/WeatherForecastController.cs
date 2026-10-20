using Microsoft.AspNetCore.Mvc;
using Workly.Api.Dtos;
using Workly.Api.Services.WeatherForecast;

namespace Workly.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController(IWeatherForecastService forecastService) : ControllerBase
{
    [HttpGet(Name = "GetWeatherForecast")]
    public IReadOnlyList<WeatherForecastDto> Get() =>
        forecastService.GetForecasts();
}
