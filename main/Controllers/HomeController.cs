using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using main.Models;
using System.Collections;
using System.Data;
using System.Xml.Linq;
using System.Reflection;
using main.Models;
using Microsoft.EntityFrameworkCore;

namespace main.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly myContext _context;

        public HomeController(ILogger<HomeController> logger, myContext context)
        {
            _context = context;
            _logger = logger;
        }
        public IActionResult Index() => View();

        public IActionResult Privacy() => View();
        public IActionResult Personal() => View();
        public IActionResult Jobs() => View(_context.UserModel.FromSql($"select personId id, lastname from persons where personId=999").SingleOrDefault());
        [HttpPost]
        public IActionResult Output()=> new {
            favOptions = new List<jobModel>
            {
                new jobModel() {Id=0, Name= "Товар №1"},
                new jobModel() {Id=1, Name= "Товар №2"},
                new jobModel() {Id=2, Name= "Товар №3"},
            }.Select(x => new { x.Id, x.Name}),
            workOptions = new List<workModel>
            {
                new workModel() {Id=0, Name= "10:00-18:00"},
                new workModel() {Id=1, Name= "18:00-22:00"},
                new workModel() {Id=2, Name= "22:00-10:00"},
            }.Select(x => new { x.Id, x.Name}),
        }.ToJsonActionResult();
        [HttpPost]
        public IActionResult AddToCart([FromBody] CartModel model)
        {
            _context.Database.ExecuteSql($"insert into cart (PersonId, ItemName) values ({model.UserId}, {model.Item})");
            _context.SaveChanges();
            return View();
        }
        public IActionResult Contacts()
        {
            return View();
        }
        public IActionResult Introduction()
        {
            return View();
        }
        public IActionResult MyCart()
        {
            return View(_context.UserModel.FromSql($"select personId id, lastname from persons where personId=999").SingleOrDefault());
        }
        [HttpPost]
        public IActionResult OutputCart([FromBody] TestModel model)=> _context.CartModel.FromSql($"select PersonId UserId, ItemName Item from Cart").ToList().ToJsonActionResult();
        
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
    public class jobModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
    }
    public class workModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Value { get; set; }
    }
    
}
