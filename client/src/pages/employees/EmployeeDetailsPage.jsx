import { useParams } from "react-router-dom";
import EmployeeDetails from "../../components/employees/EmployeeDetails";

const EmployeeDetailsPage = () => {
  const { employeeId } = useParams();

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <EmployeeDetails employeeId={employeeId} />
    </div>
  );
};

export default EmployeeDetailsPage;
