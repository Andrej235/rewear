using ReWear.Dtos.Response.User;
using ReWear.Models;

namespace ReWear.Services.Mapping.Response.UserMappers;

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
