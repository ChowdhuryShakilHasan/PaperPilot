import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function ReadingChart({ data }) {
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
      <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.16}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid stroke="#eeedf2" vertical={false}/><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill:'#a09eab',fontSize:11}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#a09eab',fontSize:11}}/><Tooltip contentStyle={{borderRadius:10,border:'1px solid #eeedf2',boxShadow:'0 8px 28px #28234b12'}}/><Area type="monotone" dataKey="papers" stroke="#2563eb" strokeWidth={2.5} fill="url(#chartFill)" activeDot={{r:5,strokeWidth:0,fill:'#2563eb'}}/>
    </AreaChart>
  </ResponsiveContainer>
}
