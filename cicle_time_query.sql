SELECT SERIAL_NUM,PASS_FAIL,To_Char(process_date,'YYYY-MM-DD HH24:MI:SS') process_date,SYSTEM_ID,STEP_NAME,CYCLE_TIME
FROM lr4_shim_assembly WHERE process_date > SYSDATE - 1 order by process_date