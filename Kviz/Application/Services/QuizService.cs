using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Infrastructure.Interfaces;
using Infrastructure.Models;

namespace Application.Services
{
    public class QuizService(IQuizRepository repository, IMapper map) : IQuizService
    {
        private readonly IQuizRepository repo = repository;
        private readonly IMapper mapper = map;

        public async Task<IEnumerable<QuizDto>> GetAllQuizzes()
        {
            try
            {
                var quizzes = await repo.GetAllAsync();
                return mapper.Map<List<QuizDto>>(quizzes);
            }
            catch
            {
                return [];
            }
        }

        public async Task<bool> AddQuiz(QuizDto newQuiz)
        {
            try
            {
                Quiz quiz = mapper.Map<Quiz>(newQuiz);
                Quiz? saved = await repo.AddAsync(quiz);
                return saved != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateQuiz(QuizDto updatedQuiz)
        {
            try
            {
                Quiz quiz = mapper.Map<Quiz>(updatedQuiz);
                Quiz? updated = await repo.UpdateAsync(quiz);
                return updated != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveQuiz(int quizId)
        {
            try
            {
                return await repo.DeleteAsync(quizId);
            }
            catch
            {
                return false;
            }
        }
    }
}
