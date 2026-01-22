using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Template.Models;
using Template.Services.ModelServices.UserService;

namespace Template.Controllers.UserController;

[Route("users")]
[ApiController]
[ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
public partial class UserController(IUserService userService, SignInManager<User> signInManager)
    : ControllerBase;
