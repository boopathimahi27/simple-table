import React, { useState } from 'react';
import { TableRow, TableCell, TextField, Button } from '@mui/material';

const RenderRows = ({ data = [], level = 0 }) => {
  const [tableData, setTableData] = useState(data);
  const [inputs, setInputs] = useState({});

  const handleInputChange = (id, value) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const updateRow = (rows, id, updater) =>
    rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row };
        updater(updatedRow);
        return updatedRow;
      } else if (row.children) {
        return { ...row, children: updateRow(row.children, id, updater) };
      }
      return row;
    });

  const rollUpParentValues = (rows) => {
    const recurse = (node) => {
      if (Array.isArray(node.children) && node.children.length > 0) {
        node.children = node.children.map(recurse);
        const oldValue = +node.value || 0;
        const newValue = node.children.reduce((sum, c) => sum + (+c.value || 0), 0);
        const variance = oldValue === 0 ? 100 : ((newValue - oldValue) / oldValue) * 100;
        return {
          ...node,
          value: +newValue.toFixed(2),
          variance: +variance.toFixed(2)
        };
      }
      return node;
    };
    return rows.map(recurse);
  };

  const handleAllocationPercentChange = (id, percentStr) => {
    const percent = parseFloat(percentStr);
    if (isNaN(percent)) return;

    const updated = updateRow(tableData, id, (row) => {
      const currentValue = parseFloat(row.value) || 0;
      const newValue = currentValue + (currentValue * percent / 100);
      const variance = ((newValue - currentValue) / currentValue) * 100;

      row.value = +newValue.toFixed(2);
      row.variance = +variance.toFixed(2);

      if (Array.isArray(row.children) && row.children.length > 0) {
        row.children = row.children.map((child) => {
          const oldChildValue = +child.value || 0;
          const newChildValue = oldChildValue + (oldChildValue * percent / 100);
          return {
            ...child,
            value: +newChildValue.toFixed(2),
            variance: +(((newChildValue - oldChildValue) / oldChildValue) * 100).toFixed(2)
          };
        });
      }
    });

    setTableData(rollUpParentValues(updated));
  };

  const handleAllocationValueChange = (id, valStr) => {
    const newVal = parseFloat(valStr);
    if (isNaN(newVal)) return;

    const updated = updateRow(tableData, id, (row) => {
      const oldVal = parseFloat(row.value) || 0;
      const variance = oldVal === 0 ? 100 : ((newVal - oldVal) / oldVal) * 100;

      row.value = +newVal.toFixed(2);
      row.variance = +variance.toFixed(2);

      if (Array.isArray(row.children) && row.children.length > 0) {
        const total = row.children.reduce((sum, child) => sum + (+child.value || 0), 0);
        if (total > 0) {
          row.children = row.children.map((child) => {
            const proportion = child.value / total;
            const newChildValue = +(newVal * proportion).toFixed(2);
            return {
              ...child,
              value: newChildValue,
              variance: +(((newChildValue - child.value) / child.value) * 100).toFixed(2),
            };
          });
        }
      }
    });

    setTableData(rollUpParentValues(updated));
  };

  const renderRows = (rows, level = 0) =>
    rows.map((row,index) => (
      <React.Fragment key={row.id}>
        <TableRow>
          <TableCell>{'  '.repeat(level)}{row.label}</TableCell>
          <TableCell>
            <TextField
              size="small"
              value={row.value}
              InputProps={{ readOnly: true }}
            />
          </TableCell>
          <TableCell>
            <TextField
            size="small"
            value={inputs[row.id] || ''}
            onChange={(e) => handleInputChange(row.id, e.target.value)}
            placeholder="Enter value"
            type="number"
            />
          </TableCell>
          <TableCell>
            <Button
              size="small"
              onClick={() => handleAllocationPercentChange(row.id, inputs[row.id])}
            >
              Allocation %
            </Button>
          </TableCell>
          <TableCell>
            <Button
              size="small"
              onClick={() => handleAllocationValueChange(row.id, inputs[row.id])}
            >
              Allocation Val
            </Button>
          </TableCell>
          <TableCell>{row.variance !== undefined ? `${row.variance}%` : '0%'}</TableCell>
        </TableRow>
        {row.children && renderRows(row.children, level + 1)}
      </React.Fragment>
    ));

  return renderRows(tableData);
};

export default RenderRows;
