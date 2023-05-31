using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using main.Models;
using System.Data;
using Microsoft.EntityFrameworkCore;

namespace main.Controllers
{
    public class SharedController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly myContext _context;
        private readonly User _user;

        public SharedController(ILogger<HomeController> logger, myContext context, User user)
        {
            _context = context;
            _logger = logger;
            _user = user;
        }
        public IActionResult _Layout() => View();
        [HttpPost]
        public void Change([FromBody] TestModel model)
        {
            var user = _user.GetUser(model.Id);
            _user.Update(user);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    } 
}
