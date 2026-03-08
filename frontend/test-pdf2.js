import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const doc = new jsPDF();
if (typeof doc.autoTable === 'function') console.log('doc.autoTable attached');
if (typeof autoTable === 'function') console.log('autoTable available');
