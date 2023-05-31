using main.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace main
{
    public class User
    {
        public Users GetUser(int id) => _context.Users.Where(x=>x.Id==id).FirstOrDefault();
        public Users GetUserByLoginPassword(string login, string password) => _context.Users.Where(x => x.Login==login&&x.Password==password).FirstOrDefault();

        public Users GetCurrentUser() {
            CurrentId = Convert.ToInt32(_accessor.HttpContext.Request.Cookies["id"]);
            return GetUser(CurrentId) != null ? GetUser(Convert.ToInt32(CurrentId)) : GetUser(Convert.ToInt32(1));
        }
        private readonly myContext _context;
        private readonly IHttpContextAccessor _accessor;

        public User(myContext context, IHttpContextAccessor accessor)
        {
            _context = context;
            _accessor = accessor;
        }
        public int CurrentId;

        public void Update(Users user)
        {
            CurrentId = user.Id;
            _accessor.HttpContext.Response.Cookies.Append("id", CurrentId.ToString());
            GetCurrentUser();
        }
    }
}