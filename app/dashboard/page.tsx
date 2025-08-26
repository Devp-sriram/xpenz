"use client";

import useSWR from 'swr';
import { fetchData } from '@/middleware/client'
import { useSession } from 'next-auth/react'

import { redirect } from "next/navigation";
import { useState , useEffect} from "react";
import { useAuth, Data } from "../context/AuthContext";
import axios, { AxiosResponse } from "axios";
import AddEmployee from "./AddEmployee";
import dotenv from "dotenv";
dotenv.config();

export default function Page() {
  const { data:session ,status }  = useSession();
  const userId = session?.user?._id; // <-- use _id from session
  
  const { data , error , loading} = useSWR(userId ? `api/dashboard?id=${userId}`: null ,fetchData);
  const [employeDetails, setEmployeDetails] = useState({
    firstname: "",
    lastname: "",
    dep: "",
  });
  const [edit, setEdit] = useState({
    status: false,
    id: "",
  });
  
  if (!status) {
    redirect("/login");
  }
  const employees = data?.res || [];

  const handleEdit = (empId: string) => {
    setEdit((prevState) => ({ ...prevState, status: true, id: empId }));
  };

  const handleSave = async () => {
    try {
      const response: AxiosResponse = await axios.put(`api/dashboard?id=${edit.id}`,
        { ...employeDetails },
      );
      console.log(response);
      //await update(edit.id);
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const handledelete = async (id: string) => {
    try {
      const response: AxiosResponse = await axios.delete(
        `api/dashboard?id=${id}`,
      );
      console.log(response);
    } catch (error: unknown) {
      console.log(error);
    }
  };
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AddEmployee />
      <h1 className="justify-center">Employees</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
             {employees.map((emp: Data) => (
              <tr key={emp._id} className="border-b">
                <td className="px-3 py-6">
                  {edit.status && edit.id === emp._id ? (
                    <>
                      <input
                        type="text"
                        value={employeDetails.firstname}
                        onChange={(e) =>
                          setEmployeDetails((prev) => ({
                            ...prev,
                            firstname: e.target.value,
                          }))
                        }
                        className="w-full md:p-2 border rounded text-black"
                      />
                      <input
                        type="text"
                        value={employeDetails.lastname}
                        onChange={(e) =>
                          setEmployeDetails((prev) => ({
                            ...prev,
                            lastname: e.target.value,
                          }))
                        }
                        className="w-full md:p-2 border rounded text-black"
                      />
                    </>
                  ) : (
                    <span className="font-medium">
                      {emp.firstname} {emp.lastname}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {edit.status && edit.id === emp._id ? (
                    <select
                      value={employeDetails.dep}
                      onChange={(e) =>
                        setEmployeDetails((prev) => ({
                          ...prev,
                          dep: e.target.value,
                        }))
                      }
                      className="text-black rounded"
                    >
                      <option value="">Department</option>
                      <option value="dentist">Dentist</option>
                      <option value="dermatologist">Dermatologist</option>
                      <option value="gynecologist">Gynecologist</option>
                    </select>
                  ) : (
                    <span>{emp.dep}</span>
                  )}
                </td>
                <td className="p-8 flex justify-center items-center space-x-2">
                  {!edit.status && (
                    <>
                      <button
                        onClick={() => {
                          handleEdit(emp?._id);
                          setEmployeDetails((prev) => ({ ...prev, ...emp }));
                        }}
                        className="px-2 py-1 bg-green-400 text-white rounded hover:bg-green-700 transition duration-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={()=>handledelete(emp?._id)}
                        className="px-2 py-1 bg-red-400 text-white rounded hover:bg-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {/* appear when the user clicks edit*/}
                  {edit.status && (
                    <button
                      onClick={async () => {
                        handleSave();
                        setEdit((prevState) => ({
                          ...prevState,
                          status: !edit.status,
                        }));
                      }}
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                    >
                      save
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
