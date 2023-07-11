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
        public IActionResult _Layout() => View(_user.GetCurrentUser());
        [HttpPost]
        public IActionResult CheckLoginPassword([FromBody] TestModel model)=> Json(_user.GetUserByLoginPassword(model.Login, model.Password) != null);
        
        [HttpPost]
        public bool Change([FromBody] TestModel model)
        {
            var user = _user.GetUserByLoginPassword(model.Login, model.Password);
            if(_user.GetUserByLoginPassword(model.Login, model.Password) != null)_user.Update(user);
            if (_user.GetUserByLoginPassword(model.Login, model.Password) == null) { return false; }
            else { return true; }
        }
        [HttpPost]
        public void Logout()
        {
            var user = _user.GetUser(1);
            _user.Update(user);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    } 
}
