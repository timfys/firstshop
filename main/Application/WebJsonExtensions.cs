using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace main;

public static class WebJsonExtensions
{
    //public static IActionResult ToJsonActionResultWithDate(this object item) => new ContentResult { Content = item.ToCamelCaseJsonWithDate(), ContentType = "application/json" };
    public static readonly JsonSerializerOptions CamelCase = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
    };
    public static IActionResult ToJsonActionResult(this object item) => new ContentResult { Content = item.ToCamelCaseJson(), ContentType = "application/json" };
    public static string ToCamelCaseJson(this object objective) => JsonSerializer.Serialize(objective, CamelCase);
   
}
