using Application.DTOs;

namespace Application.Interfaces
{
    public interface IQuizService
    {
        public Task<bool> AddQuiz(QuizDto newQuiz);
        public Task<bool> UpdateQuiz(QuizDto updatedQuiz);
        public Task<bool> RemoveQuiz(int quizId);
        public Task<IEnumerable<QuizDto>> GetAllQuizzes();
    }
}
