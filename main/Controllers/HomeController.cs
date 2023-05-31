using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using main.Models;
using System.Data;
using Microsoft.EntityFrameworkCore;

namespace main.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly myContext _context;
        private readonly User _user;

        public HomeController(ILogger<HomeController> logger, myContext context, User user)
        {
            _context = context;
            _logger = logger;
            _user = user;
        }
        public IActionResult Index() => View();

        public IActionResult Privacy() => View();
        public IActionResult Personal() => View();
        public IActionResult Jobs() => View(_user.GetCurrentUser());
        [HttpPost]
        public IActionResult Output()=> Json(new {
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
        });
        [HttpPost]
        public IActionResult AddToCart([FromBody] CartModel model)
        {
            _context.Database.ExecuteSql($"insert into cart (PersonId, ItemName) values ({model.UserId}, {model.Item})");
            _context.SaveChanges();
            return View();
        }
        [HttpPost]
        public IActionResult RemoveFromCart([FromBody] CartModel model)
        {
            _context.Database.ExecuteSql($"delete from cart where id={model.Id}");
            _context.SaveChanges();
            return View();
        }
        [HttpPost]
        public void Change([FromBody] TestModel model)
        {
            var user = _user.GetUser(model.Id);
            _user.Update(user);
        }
        public IActionResult Contacts()
        {
            return View();
        }
        public IActionResult Introduction()
        {
            return View();
        }
        public IActionResult MyCart(int id) => View(_user.GetCurrentUser());
        [HttpPost]
        public IActionResult OutputCart([FromBody] TestModel model)=> Json(_context.CartModel.FromSql($"select id, PersonId UserId, ItemName Item from Cart where PersonId={model.Id}").ToList());
        [HttpPost]
        public IActionResult OutputUsers() => Json(_context.Persons.ToList());
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
