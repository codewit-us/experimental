import unittest
from code import GradeBook
import xmlrunner
class TestGradeBook(unittest.TestCase):
    def setUp(self):
        self.gradebook = GradeBook()

    def test_initial_average(self):
        self.assertEqual(self.gradebook.get_average(), 0)

    def test_add_grade(self):
        self.gradebook.add_grade(80)
        self.gradebook.add_grade(95)
        self.assertEqual(self.gradebook.get_average(), 87.5)

    def test_empty_gradebook_average(self):
        self.assertEqual(self.gradebook.get_average(), 0)

if __name__ == '__main__':
    unittest.main(
        testRunner=xmlrunner.XMLTestRunner(output='./test-reports'),
        # these make sure that some options that are not applicable
        # remain hidden from the help menu.
        )