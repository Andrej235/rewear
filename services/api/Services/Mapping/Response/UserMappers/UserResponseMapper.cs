using Template.Dtos.Response.User;
using Template.Models;

namespace Template.Services.Mapping.Response.UserMappers;

public class UserResponseMapper : IResponseMapper<User, UserResponseDto>
{
    public UserResponseDto Map(User from) =>
        new()
        {
            Email = from.Email!,
            Username = from.UserName!,
            IsEmailVerified = from.EmailConfirmed,
        };
}
