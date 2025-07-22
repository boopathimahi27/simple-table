import React, { useEffect, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material';
import { initialParentData } from './Constants';
import RenderRows from './RenderRow';


// Function to calculate the value of each parent row based on its children
const calculateParentValues = (data) => {
  return data.map(parent => {
    const totalValue = parent.children.reduce((sum, child) => sum + child.value, 0);
    return {
      ...parent,
      value: totalValue,
      children: parent.children.map(child => ({
        ...child,
        value: child.value // Ensure children values are preserved
      }))
    };
  });
};



export default function SimpleTable() {

  const [initialData, setInitialData] = useState(
    initialParentData?.rows ?? []);

  return (
    <Box style={{padding: '70px 10px 10px 20px'}}>
      <Typography variant="h4" gutterBottom>
        Hierarchical Table Example
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        This table demonstrates a hierarchical structure with parent and child rows.
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Label</b></TableCell>
              <TableCell><b>Value</b></TableCell>
              <TableCell><b>Input</b></TableCell>
              <TableCell><b>Allocation %</b></TableCell>
              <TableCell><b>Allocation Val</b></TableCell>
              <TableCell><b>Variance %</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {
            <RenderRows
            data={initialData}
              rows={calculateParentValues(initialData)}
            />
          }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
