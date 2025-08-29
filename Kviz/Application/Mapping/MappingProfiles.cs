using Application.DTOs;
using AutoMapper;
using Infrastructure.Models;

namespace Application.Mapping
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<UserDto, User>().ReverseMap();
            CreateMap<QuizDto, Quiz>().ReverseMap();
            CreateMap<ResultDto, Result>().ReverseMap();
        }
    }
}
