import { gql } from '@apollo/client';

// Query to get assignments
export const GET_ASSIGNMENTS = gql`
  query GetAssignments {
    Assignments {
      ID
      created_at
      Assignment_Name
      Assignment_Area
      Assignment_Taken
      Assignment_Status
      Taken_ID
      Assignment_Description
      Assignment_Address
    }
  }
`;


export const GET_ASSIGNMENT_BY_ID = gql`
  query GetAssignment($id: Int!) { 
    Assignments(where: { ID: { _eq: $id } }) {
      ID
      Assignment_Name
      Assignment_Description
      Assignment_Address
      Assignment_Taken
    }
  }
`;

// Mutation to add an assignment
export const ADD_ASSIGNMENT = gql`
  mutation AddAssignment($name: String!, $area: String!) {
    insert_Assignments(objects: { Assignment_Name: $name, Assignment_Area: $area }) {
      returning {
        ID
        Assignment_Name
        Assignment_Area
      }
    }
  }
`;

// Mutation to update an assignment
export const UPDATE_ASSIGNMENT = gql`
  mutation UpdateAssignment(
    $id: Int!
    $Assignment_Name: String!
    $Assignment_Area: String!
    $Assignment_Taken: Boolean!
    $Assignment_Status: String!
    $Taken_ID: Int
  ) {
    update_Assignments_by_pk(
      pk_columns: { ID: $id },
      _set: {
        Assignment_Name: $Assignment_Name,
        Assignment_Area: $Assignment_Area,
        Assignment_Taken: $Assignment_Taken,
        Assignment_Status: $Assignment_Status,
        Taken_ID: $Taken_ID
      }
    ) {
      ID
      Assignment_Name
      Assignment_Area
      Assignment_Taken
      Assignment_Status
      Taken_ID
    }
  }
`;

export const VOLUNTEER_UPDATE_ASSIGNMENT = gql`
  mutation VolunteerUpdateAssignment($id: Int!, $Assignment_Taken: Boolean!, $Assignment_Status: String!, $Taken_ID: Int!) {
    update_Assignments_by_pk(
      pk_columns: { ID: $id },
      _set: {
        Assignment_Taken: $Assignment_Taken,
        Assignment_Status: $Assignment_Status,
        Taken_ID: $Taken_ID
      }
    ) {
      ID
      Assignment_Taken
      Assignment_Status
    }
  }
`;


export const GET_USER_ASSIGNMENTS = gql`
  query GetUserAssignments($takenId: Int!) {
    Assignments(where: { Taken_ID: $takenId, Assignment_Status: "Assigned" }) {
      ID
      Assignment_Status
    }
  }
`;


export const DELETE_ASSIGNMENT = gql`
  mutation DeleteAssignment($id: Int!) {
    delete_assignments_by_pk(id: $id) {
      ID
    }
  }
`;