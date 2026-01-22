using FluentResults;

namespace ReWear.Errors;

public class BadRequest(string message) : Error(message) { }
